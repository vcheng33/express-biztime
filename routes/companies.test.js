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
});

afterEach(async function () {
    await db.query(`DELETE FROM companies`)
});

afterAll(async function () {
    await db.end();
});

describe("GET /companies", function () {
    it("Gets a list of companies", async function () {
        const resp = await request(app).get(`/companies`);

        expect(resp.body).toEqual({
            companies: [
                {
                    code: "fb",
                    name: "Facebook",
                    description: "soul sucking social media"
                },
            ]
        });
    });
});

describe("GET /companies/fb", function () {
    it("Gets info of single company", async function () {
        const resp = await request(app).get(`/companies/fb`);
        // console.log("resp.body", resp.body)
        // console.log("testInvoice", testInvoice)
        expect(resp.body).toEqual({
            company:
            {
                code: "fb",
                name: "Facebook",
                description: "soul sucking social media",
                invoices: [{
                    id: testInvoice[0].id,
                    comp_code: "fb",
                    amt: "200.00",
                    paid: false,
                    add_date: '2021-01-01T08:00:00.000Z',
                    paid_date: null
                }]
            },

        });
    });
    it("Responds with 404 if can't find item", async function () {
        const response = await request(app).get(`/companies/0`);
        expect(response.statusCode).toEqual(404);
    });
});

describe("POST /companies", function () {
    it("Creates a new company", async function () {
        const resp = await request(app)
            .post(`/companies`)
            .send({
                code: "google",
                name: "Google",
                description: "web services"
            });
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            company: {
                code: "google",
                name: "Google",
                description: "web services"
            },
        });
    });
});

describe("PUT /companies/:code", function () {
    it("Updates a single company", async function () {
        const resp = await request(app)
            .put(`/companies/fb`)
            .send({
                name: "Instagram",
                description: "Not much better than fb"
            });
        expect(resp.body).toEqual({
            company: {
                code: "fb",
                name: "Instagram",
                description: "Not much better than fb"
            },
        });
    });
});

describe("DELETE /companies/:code", function () {
    it("Deletes a single company", async function () {
        
        const resp = await request(app)
            .delete(`/companies/fb`);
        
        expect(resp.body).toEqual({ status: "Deleted" });
    });
});