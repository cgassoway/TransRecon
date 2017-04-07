--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.2
-- Dumped by pg_dump version 9.6.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: balances; Type: TABLE; Schema: public; Owner: cgassoway
--

CREATE TABLE balances (
    date date,
    "fiName" character varying(30),
    "accountName" character varying(30),
    "accountId" character varying(15),
    "accountType" character varying(30),
    "currentBalance" money,
    "startingBalance" money,
    "endingBalance" money,
    "dueDate" date,
    "dueAmt" money,
    balances_id integer NOT NULL
);


ALTER TABLE balances OWNER TO cgassoway;

--
-- Name: balances_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: cgassoway
--

CREATE SEQUENCE balances_balances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE balances_balances_id_seq OWNER TO cgassoway;

--
-- Name: balances_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cgassoway
--

ALTER SEQUENCE balances_balances_id_seq OWNED BY balances.balances_id;


--
-- Name: plan; Type: TABLE; Schema: public; Owner: cgassoway
--

CREATE TABLE plan (
    date date,
    "fiName" character varying(30),
    "accountName" character varying(30),
    merchant character varying(30),
    amount money,
    frequency character varying(10),
    "untilDate" date,
    memo character(100),
    plan_id integer NOT NULL
);


ALTER TABLE plan OWNER TO cgassoway;

--
-- Name: plan_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: cgassoway
--

CREATE SEQUENCE plan_plan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE plan_plan_id_seq OWNER TO cgassoway;

--
-- Name: plan_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cgassoway
--

ALTER SEQUENCE plan_plan_id_seq OWNED BY plan.plan_id;


--
-- Name: register; Type: TABLE; Schema: public; Owner: cgassoway
--

CREATE TABLE register (
    date date,
    "accountName" character varying(30),
    "fiName" character varying(30),
    merchant character varying(30),
    amount money,
    memo character varying(100),
    transaction_id integer NOT NULL,
    status character varying(5),
    "statusDate" date,
    register_id integer NOT NULL
);


ALTER TABLE register OWNER TO cgassoway;

--
-- Name: register_register_id_seq; Type: SEQUENCE; Schema: public; Owner: cgassoway
--

CREATE SEQUENCE register_register_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE register_register_id_seq OWNER TO cgassoway;

--
-- Name: register_register_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cgassoway
--

ALTER SEQUENCE register_register_id_seq OWNED BY register.register_id;


--
-- Name: register_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: cgassoway
--

CREATE SEQUENCE register_transaction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE register_transaction_id_seq OWNER TO cgassoway;

--
-- Name: register_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cgassoway
--

ALTER SEQUENCE register_transaction_id_seq OWNED BY register.transaction_id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: cgassoway
--

CREATE TABLE transactions (
    transaction_id integer NOT NULL,
    "fiName" character varying(30),
    "accountName" character varying(30),
    merchant character varying(30),
    amount money,
    "transactionType" character varying(10),
    category character varying(30),
    register_id integer,
    status character varying(10),
    "statusDate" date
);


ALTER TABLE transactions OWNER TO cgassoway;

--
-- Name: transactions_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: cgassoway
--

CREATE SEQUENCE transactions_transaction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE transactions_transaction_id_seq OWNER TO cgassoway;

--
-- Name: transactions_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cgassoway
--

ALTER SEQUENCE transactions_transaction_id_seq OWNED BY transactions.transaction_id;


--
-- Name: balances balances_id; Type: DEFAULT; Schema: public; Owner: cgassoway
--

ALTER TABLE ONLY balances ALTER COLUMN balances_id SET DEFAULT nextval('balances_balances_id_seq'::regclass);


--
-- Name: plan plan_id; Type: DEFAULT; Schema: public; Owner: cgassoway
--

ALTER TABLE ONLY plan ALTER COLUMN plan_id SET DEFAULT nextval('plan_plan_id_seq'::regclass);


--
-- Name: register register_id; Type: DEFAULT; Schema: public; Owner: cgassoway
--

ALTER TABLE ONLY register ALTER COLUMN register_id SET DEFAULT nextval('register_register_id_seq'::regclass);


--
-- Name: transactions transaction_id; Type: DEFAULT; Schema: public; Owner: cgassoway
--

ALTER TABLE ONLY transactions ALTER COLUMN transaction_id SET DEFAULT nextval('transactions_transaction_id_seq'::regclass);


--
-- Data for Name: balances; Type: TABLE DATA; Schema: public; Owner: cgassoway
--

COPY balances (date, "fiName", "accountName", "accountId", "accountType", "currentBalance", "startingBalance", "endingBalance", "dueDate", "dueAmt", balances_id) FROM stdin;
\.


--
-- Name: balances_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cgassoway
--

SELECT pg_catalog.setval('balances_balances_id_seq', 1, false);


--
-- Data for Name: plan; Type: TABLE DATA; Schema: public; Owner: cgassoway
--

COPY plan (date, "fiName", "accountName", merchant, amount, frequency, "untilDate", memo, plan_id) FROM stdin;
\.


--
-- Name: plan_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cgassoway
--

SELECT pg_catalog.setval('plan_plan_id_seq', 1, false);


--
-- Data for Name: register; Type: TABLE DATA; Schema: public; Owner: cgassoway
--

COPY register (date, "accountName", "fiName", merchant, amount, memo, transaction_id, status, "statusDate", register_id) FROM stdin;
\.


--
-- Name: register_register_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cgassoway
--

SELECT pg_catalog.setval('register_register_id_seq', 1, false);


--
-- Name: register_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cgassoway
--

SELECT pg_catalog.setval('register_transaction_id_seq', 1, false);


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: cgassoway
--

COPY transactions (transaction_id, "fiName", "accountName", merchant, amount, "transactionType", category, register_id, status, "statusDate") FROM stdin;
\.


--
-- Name: transactions_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cgassoway
--

SELECT pg_catalog.setval('transactions_transaction_id_seq', 1, false);


--
-- Name: balances balances_pkey; Type: CONSTRAINT; Schema: public; Owner: cgassoway
--

ALTER TABLE ONLY balances
    ADD CONSTRAINT balances_pkey PRIMARY KEY (balances_id);


--
-- Name: plan plan_pkey; Type: CONSTRAINT; Schema: public; Owner: cgassoway
--

ALTER TABLE ONLY plan
    ADD CONSTRAINT plan_pkey PRIMARY KEY (plan_id);


--
-- Name: register register_pkey; Type: CONSTRAINT; Schema: public; Owner: cgassoway
--

ALTER TABLE ONLY register
    ADD CONSTRAINT register_pkey PRIMARY KEY (register_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: cgassoway
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (transaction_id);


--
-- Name: register register_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cgassoway
--

ALTER TABLE ONLY register
    ADD CONSTRAINT register_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id);


--
-- Name: transactions transactions_register_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cgassoway
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_register_id_fkey FOREIGN KEY (register_id) REFERENCES register(register_id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON SCHEMA public TO cgassoway;


--
-- PostgreSQL database dump complete
--

