"use strict";
/** INVOICE RELATED ROUTES */

const db = require("../db");
const express = require("express");
const router = express.Router();
const { NotFoundError } = require("../expressError");

/**
 * Get invoices, returning {invoices: [{code, name}, ...]}
 */
router.get("/",
    async function (req, res, next) {

        const results = await db.query(
            `SELECT id, comp_code, amt, paid, add_date, paid_date
            FROM invoices
            ORDER BY id`);
        const invoices = results.rows;
        return res.json({ invoices });
    })

/**
* Get single invoices, returning {invoices: {id, comp_code, amt, paid, add_date, paid_date}}
*/
router.get("/:id",
    async function (req, res, next) {
        const id = req.params.id;
        const result = await db.query(
            `SELECT id, comp_code, amt, paid, add_date, paid_date
            FROM invoices
            WHERE id = $1
            ORDER BY id`, [id]);
        const invoice = result.rows[0];

        const cResult = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code = $1`, [invoice.comp_code]);
        const company = cResult.rows[0];

        invoice.company = company;

        if (result.rows.length === 0) {
            throw new NotFoundError();
        }

        return res.json({ invoice });
    })

/**
* Create invoices, returning {invoices: {id, comp_code, amt, paid, add_date, paid_date}}
*/
router.post("/", async function (req, res, next) {
    const { comp_code, amt } = req.body;

    const result = await db.query(
        `INSERT INTO invoices (comp_code, amt)
             VALUES ($1, $2)
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [comp_code, amt],
    );
    const invoices = result.rows[0];
    return res.status(201).json({ invoices });
});

/**
* Update invoices, returning {invoices: {id, comp_code, amt, paid, add_date, paid_date}}
*/
router.put("/:id", async function (req, res, next) {
    const { amt } = req.body;
    const result = await db.query(
        `UPDATE invoices
              SET amt=$1
              WHERE id = $2
              RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [amt, req.params.id],
    );
    const invoices = result.rows[0];
    if (result.rows.length === 0) {
        throw new NotFoundError()
    }
    return res.json({ invoices });
});
/**
* Delete invoices, returning {status: "Deleted"}
*/
router.delete("/:id", async function (req, res, next) {

    const result = await db.query(
        `DELETE FROM invoices 
        WHERE id = $1
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [req.params.id],
    );
    console.log("result", result)
    if (result.rows.length === 0) {
        throw new NotFoundError()
    }
    return res.json({ status: "Deleted" });
});

module.exports = router;