"use strict";

const db = require("../db");
const express = require("express");
const router = express.Router();
const { NotFoundError } = require("../expressError");


// TO DO: ADDING ORDER BY
/**
 * Get companies, returning {companies: [{code, name}, ...]}
 */
router.get("/",
    async function (req, res, next) {

        const results = await db.query(
            `SELECT code, name, description
               FROM companies`);
        const companies = results.rows;
        return res.json({ companies });
    })

/**
 * Get single company, returning {company: {code, name, description}}
 */
router.get("/:code",
    async function (req, res, next) {
        const code = req.params.code;
        const results = await db.query(
            `SELECT code, name, description
               FROM companies
               WHERE code = $1`, [code]);
        const company = results.rows[0];

        const iResults = await db.query(
            `SELECT id, comp_code, amt, paid, add_date, paid_date
            FROM invoices
            WHERE comp_code = $1
            ORDER BY id`, [company.code]);
        const invoices = iResults.rows;

        if (results.rows.length === 0) {
            throw new NotFoundError()
        }

        company.invoices = invoices;

        return res.json({ company });
    })

/**
 * Create company, returning {company: {code, name, description}}
 */
router.post("/", async function (req, res, next) {
    const { code, name, description } = req.body;

    const result = await db.query(
        `INSERT INTO companies (code, name, description)
                VALUES ($1, $2, $3)
                RETURNING code, name, description`,
        [code, name, description],
    );
    const company = result.rows[0];
    return res.status(201).json({ company });
});

/**
 * Update company, returning {company: {code, name, description}}
 */
router.put("/:code", async function (req, res, next) {
    const { name, description } = req.body;
    const result = await db.query(
        `UPDATE companies
                 SET name=$1,
                     description=$2
                 WHERE code = $3
                 RETURNING code, name, description`,
        [name, description, req.params.code],
    );
    const company = result.rows[0];
    if (result.rows.length === 0) {
        throw new NotFoundError()
    }
    return res.json({ company });
});

/**
 * Delete company, returning {status: "Deleted"}
 */
router.delete("/:code", async function (req, res, next) {

    const result = await db.query(
        `DELETE FROM companies 
        WHERE code = $1
        RETURNING code, name, description`,
        [req.params.code],
    );
    // console.log("result", result)
    if (result.rows.length === 0) {
        throw new NotFoundError()
    }
    return res.json({ status: "Deleted" });
});

module.exports = router;