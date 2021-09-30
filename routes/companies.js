"use strict";

const db = require("../db");
const express = require("express");
const router = express.Router();
const { NotFoundError } = require("../expressError");

router.get("/",
    async function (req, res, next) {

        const results = await db.query(
            `SELECT code, name, description
               FROM companies`);
        const companies = results.rows;
        return res.json({ companies });
    })

router.get("/:code",
    async function (req, res, next) {
        let code = req.params.code;
        const results = await db.query(
            `SELECT code, name, description
               FROM companies
               WHERE code = $1`, [code]);
        const company = results.rows[0];

        if (results.rows.length === 0) {
            throw new NotFoundError()
        }

        return res.json({ company });
    })

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

module.exports = router;