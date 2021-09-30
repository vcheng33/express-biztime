const request = require("supertest");

const app = require("../app");

let db = require("../db");

let testCompany;
let testInvoice;

beforeEach(async function () {
    const results = await db.query(
        `INSERT INTO companies (code, name, description)
                VALUES ('fb', 'Facebook', 'soul sucking social media')
                RETURNING code, name, description`)
    testCompany = results.rows[0];

    const iResults = await db.query(
        `INSERT INTO invoices (comp_code, amt, add_date)
            VALUES ('fb', '200.00', '2021-01-01')
            RETURNING id, comp_code, amt, paid, add_date, paid_date`
    )
    testInvoice = iResults.rows;
    // testInvoice = JSON.parse(testInvoice);
    // console.log("testInvoice:", testInvoice);
});

afterEach(async function () {
    await db.query(`DELETE FROM companies`);
});

afterAll(async function () {
    await db.end();
});


describe("GET /invoices", function () {
    it("Gets a list of invoices", async function () {
        const resp = await request(app).get(`/invoices`);

        expect(resp.body).toEqual({
            invoices: [
                {
                    id: testInvoice[0].id,
                    comp_code: "fb",
                    amt: "200.00",
                    paid: false,
                    add_date: '2021-01-01T08:00:00.000Z',
                    paid_date: null
                },
            ]
        });
    });
});

describe("GET /invoices/:id", function () {
    it("Gets info of single invoice", async function () {
        const resp = await request(app).get(`/invoices/${testInvoice[0].id}`);
        // console.log("resp.body", resp.body)
        // console.log("testInvoice", testInvoice)
        expect(resp.body).toEqual({
            invoice:
            {
                id: testInvoice[0].id,
                    comp_code: "fb",
                    amt: "200.00",
                    paid: false,
                    add_date: '2021-01-01T08:00:00.000Z',
                    paid_date: null,
                    company: {
                        code:'fb',
                        name: 'Facebook',
                        description: 'soul sucking social media'
                    }
            },

        });
    });
});


describe("POST /invoices", function () {
    it("Creates a new invoice", async function () {
        const resp = await request(app)
            .post(`/invoices`)
            .send({
                comp_code: "fb",
                amt: "300.00"
            });
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            invoices: {
                id: expect.any(Number),
                    comp_code: "fb",
                    amt: "300.00",
                    paid: false,
                    add_date: expect.any(String),
                    paid_date: null
            },
        });
    });
});

describe("PUT /invoices/:id", function () {
    it("Updates a single invoice", async function () {
        const resp = await request(app)
            .put(`/invoices/${testInvoice[0].id}`)
            .send({
                amt: "10000.00"
            });
        expect(resp.body).toEqual({
            invoices: {
                id: testInvoice[0].id,
                    comp_code: "fb",
                    amt: "10000.00",
                    paid: false,
                    add_date: '2021-01-01T08:00:00.000Z',
                    paid_date: null
            },
        });
    });
});


describe("DELETE /invoices/:id", function () {
    it("Deletes a single invoice", async function () {
        
        const resp = await request(app)
            .delete(`/invoices/${testInvoice[0].id}`);
        
        expect(resp.body).toEqual({ status: "Deleted" });
    });
});