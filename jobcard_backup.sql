--
-- PostgreSQL database dump
--

\restrict Cv2O1xqVAjv6NcmOrIdiRoeDQzcgQo7H1juxWfNraMWJM1xeKJ2m1cF0mqadWGn

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: BentaObwar
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO "BentaObwar";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: jobcard_history; Type: TABLE; Schema: public; Owner: BentaObwar
--

CREATE TABLE public.jobcard_history (
    id integer NOT NULL,
    jobcard_id integer NOT NULL,
    technician_id integer,
    customer_id integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    description text,
    work_done text,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    customer_comments text,
    duration interval,
    supervisor_id integer,
    payment_phone character varying(20),
    amount numeric(10,2),
    customer_name text,
    technician_name text,
    supervisor_name text,
    scheduleddate timestamp without time zone DEFAULT now(),
    visits jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    email character varying(255),
    phone_number character varying(20),
    CONSTRAINT jobcard_history_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.jobcard_history OWNER TO "BentaObwar";

--
-- Name: jobcard_history_id_seq; Type: SEQUENCE; Schema: public; Owner: BentaObwar
--

CREATE SEQUENCE public.jobcard_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobcard_history_id_seq OWNER TO "BentaObwar";

--
-- Name: jobcard_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: BentaObwar
--

ALTER SEQUENCE public.jobcard_history_id_seq OWNED BY public.jobcard_history.id;


--
-- Name: jobcards; Type: TABLE; Schema: public; Owner: BentaObwar
--

CREATE TABLE public.jobcards (
    id integer NOT NULL,
    job_number character varying(20) NOT NULL,
    customer_id integer NOT NULL,
    technician_id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    location character varying(150),
    assignedto text,
    scheduleddate date,
    customer_name text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    supervisor_id integer,
    supervisor_name character varying(255)
);


ALTER TABLE public.jobcards OWNER TO "BentaObwar";

--
-- Name: jobcards_id_seq; Type: SEQUENCE; Schema: public; Owner: BentaObwar
--

CREATE SEQUENCE public.jobcards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobcards_id_seq OWNER TO "BentaObwar";

--
-- Name: jobcards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: BentaObwar
--

ALTER SEQUENCE public.jobcards_id_seq OWNED BY public.jobcards.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: BentaObwar
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password text NOT NULL,
    role character varying(20),
    created_at timestamp without time zone DEFAULT now(),
    address text,
    phone_number character varying(20),
    updated_at timestamp without time zone DEFAULT now(),
    reset_token text,
    reset_token_expires timestamp without time zone,
    supervisor_id integer,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'supervisor'::character varying, 'technician'::character varying, 'customer'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO "BentaObwar";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: BentaObwar
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO "BentaObwar";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: BentaObwar
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: jobcard_history id; Type: DEFAULT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcard_history ALTER COLUMN id SET DEFAULT nextval('public.jobcard_history_id_seq'::regclass);


--
-- Name: jobcards id; Type: DEFAULT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcards ALTER COLUMN id SET DEFAULT nextval('public.jobcards_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: jobcard_history; Type: TABLE DATA; Schema: public; Owner: BentaObwar
--

COPY public.jobcard_history (id, jobcard_id, technician_id, customer_id, status, description, work_done, start_time, end_time, customer_comments, duration, supervisor_id, payment_phone, amount, customer_name, technician_name, supervisor_name, scheduleddate, visits, created_at, email, phone_number) FROM stdin;
25	65	3	8	completed	Deploy the school management system	Work was done successfully	2026-07-08 09:00:00	2026-07-08 11:00:00	Job well done	02:00:00	1	0795147261	1.00	karim_abdul	benta_obwar	Alice Jane	2026-07-08 10:59:18.191748	[{"id": 1783533591173, "date": "2026-07-08", "end_time": "08:00", "work_done": "Deploytment", "start_time": "06:00"}, {"id": 1783533616244, "date": "2026-07-08", "end_time": "11:00", "work_done": "work done", "start_time": "09:00"}]	2026-07-08 10:59:18.191748	bentaobwar@gmail.com	0795147261
18	58	3	6	completed	\N	done	2026-07-02 10:39:00	2026-07-02 13:00:00	hfygbn	02:21:00	1	0700095842	25000.00	maseno_university	benta_obwar	alice_jane	2026-06-30 00:17:44.855571	[{"id": 1782939400748, "date": "2026-07-07", "end_time": "12:00", "work_done": "hgfdzxfgfdfc", "start_time": "06:01"}, {"id": 1782940250443, "date": "2026-07-02", "end_time": "13:11", "work_done": "change the machine", "start_time": "12:11"}, {"id": 1782941975518, "date": "2026-07-02", "end_time": "13:00", "work_done": "jeje route", "start_time": "10:39"}]	2026-06-30 00:17:44.855571	evonadhiambo@gmail.com	0727297034
26	66	2	6	in_progress	Do maintainance to all the machines	\N	\N	\N	\N	\N	1	\N	\N	maseno_university	John Mwangi	Alice Jane	2026-07-18 18:48:28.376169	\N	2026-07-18 18:48:28.376169	benny@gmail.com	0795147261
20	56	2	6	pending	Transport the toners for scanners	\N	\N	\N	kjhgcv	\N	1	0798678909	5.00	maseno_university	john_mwangi	alice_jane	2026-07-01 08:58:52.115564	\N	2026-07-01 08:58:52.115564		
19	57	2	5	completed	\N	\N	\N	\N	\N	\N	1	\N	\N	evon_sheti	john_mwangi	alice_jane	2026-06-30 00:18:16.300002	\N	2026-06-30 00:18:16.300002		
27	67	2	5	completed	Repair the broken printers and scanners	The work was done and complete in due time.	2026-07-20 08:20:00	2026-07-20 09:22:00		01:02:00	1	\N	\N	evon_sheti	John Mwangi	Alice Jane	2026-07-20 09:04:39.972852	[{"id": 1784564172927, "date": "2026-07-20", "end_time": "07:00", "work_done": "Cleaned the scanners", "start_time": "06:00"}, {"id": 1784564259283, "date": "2026-07-20", "end_time": "08:10", "work_done": "Cleaned the printers", "start_time": "07:10"}, {"id": 1784564366185, "date": "2026-07-20", "end_time": "09:22", "work_done": "Repairs of the scanners and printers", "start_time": "08:20"}]	2026-07-20 09:04:39.972852	bentaobwar@gmail.com	0795147261
22	62	3	8	completed	Fix all the scanners and printers	All job was done well	2026-07-05 07:00:00	2026-07-05 11:00:00		04:00:00	1	\N	\N	karim_abdul	benta_obwar	alice_jane	2026-07-06 15:38:06.903662	[{"id": 1783377520738, "date": "2026-07-05", "end_time": "11:00", "work_done": "fixing the machines", "start_time": "07:00"}]	2026-07-06 15:38:06.903662	nyagakaenock@gmail.com	0704274052
28	68	3	6	completed	Configure the routers and switches.	All work was done correctly.	2026-07-20 09:40:00	2026-07-20 10:08:00	Satisfactory.	00:28:00	1	0795147261	1.00	Maseno University	benta_obwar	Alice Jane	2026-07-20 10:05:24.102	[{"id": 1784567206839, "date": "2026-07-20", "end_time": "08:10", "work_done": "Cleaning Routers and switches", "start_time": "07:10"}, {"id": 1784567240894, "date": "2026-07-20", "end_time": "09:30", "work_done": "Configure Routers", "start_time": "08:30"}, {"id": 1784567278457, "date": "2026-07-20", "end_time": "10:08", "work_done": "Configure Switches", "start_time": "09:40"}]	2026-07-20 10:05:24.102	bentaobwar@gmail.com	0704274052
\.


--
-- Data for Name: jobcards; Type: TABLE DATA; Schema: public; Owner: BentaObwar
--

COPY public.jobcards (id, job_number, customer_id, technician_id, title, description, location, assignedto, scheduleddate, customer_name, created_at, status, supervisor_id, supervisor_name) FROM stdin;
67	JB001	5	2	Scanner and printer repair	Repair the broken printers and scanners	Westlands, encee place	John Mwangi	2026-07-20	evon_sheti	2026-07-20 09:04:09.128317	completed	1	Alice Jane
68	JB002	6	3	Configuration of Routers and switches	Configure the routers and switches.	Mombasa, Diani	benta_obwar	2026-07-20	Maseno University	2026-07-20 10:04:54.3242	completed	1	Alice Jane
62	JB0456	8	3	Preventive maintainance	Fix all the scanners and printers	Kisumu, molem	benta_obwar	2026-07-05	karim_abdul	2026-07-06 15:37:14.509219	completed	1	alice_jane
65	JH0089	8	3	SMS service	Deploy the school management system	Moi forces school	benta_obwar	2026-07-08	karim_abdul	2026-07-08 10:58:48.07528	completed	1	Alice Jane
66	JB0068	6	2	Preventive maintainance	Do maintainance to all the machines	Kisumu, maseno	John Mwangi	2026-07-19	maseno_university	2026-07-18 18:47:55.435892	in_progress	1	Alice Jane
57	JB005	5	2	IT services	configure routers and switches for IT services	westlands	john_mwangi	2026-06-18	evon_sheti	2026-06-23 11:49:56.942983	completed	1	alice_jane
56	JB004	6	2	Scanner Toner	Transport the toners for scanners	Pangani	john_mwangi	2026-06-22	maseno_university	2026-06-23 11:46:59.168201	pending	1	alice_jane
58	JB0016	6	3	CMS App	Deploy the app and ensure its working	Mombasa	benta_obwar	2026-06-22	maseno_university	2026-06-23 12:18:18.017472	completed	1	alice_jane
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: BentaObwar
--

COPY public.users (id, username, email, password, role, created_at, address, phone_number, updated_at, reset_token, reset_token_expires, supervisor_id) FROM stdin;
10	Meshack Obwar	meshackobwar@copycat.com	$2b$10$n46W720ixM9GWsWpixjkwuqWWhehtfGa6wwUnA4A2X7pqUwFvKdpC	technician	2026-07-27 08:53:35.499688	\N	0113678534	2026-07-27 08:53:35.499688	\N	\N	1
11	Collins Obwar	collinsobwar@copycat.com	$2b$10$ixWCLw3O2XamNajv7/4/W.iOP2GJBi/p01TOATCoPvGLbQF/076wS	customer	2026-07-27 09:03:55.967911	\N	0789300234	2026-07-27 09:03:55.967911	\N	\N	1
6	Maseno University	maseno@gmail.com	$2b$10$W5CUETpvQ1MzQGNVsmVYGOhH.p8/r9IMYsaBJg2tqUw0Yuh5CZJ2q	customer	2026-06-23 08:46:30.360193			2026-07-18 18:50:31.06845	c090a9303b55a8745c8f1d03e16f011cc6529acf4808d8d543329b999450c60d	2026-07-09 16:58:05.672	\N
5	evon_sheti	evonsheti@gmail.com	$2b$10$IQWmP7toomy3IJuQqrqW7ehv/e/bFggPF2tm24zD3b0qTLP6V4zfG	customer	2026-06-23 05:43:33.132516	P.O BOX 123	0722589006	2026-07-20 09:12:07.164601	\N	\N	\N
13	Rosemary Awuor	rosemaryawuor@gmail.com	$2b$10$y7L5FjpbHfs0mc6SoobzGuxdBi/xi6KhiuyJHIIyS9D59hehJ08au	customer	2026-07-27 09:24:18.614919	\N	0700095842	2026-07-27 09:24:18.614919	\N	\N	1
1	Alice Jane	alicejane@gmail.com	$2b$10$jD29DmOJpPRaACNAFGdvwuJBFAlKVlOwUz6wnI.FI5DwBxNdTPHlq	supervisor	2026-06-17 16:44:05.635781	P.O BOX 28	0704274052	2026-07-20 10:22:32.727084	c35e86332c65c43e52497250538a3d9c5ae4b22e0e51fc2da5505361e170d1c5	2026-07-16 09:43:00.799	\N
15	Tamara Jayden	tamara@copycat.com	$2b$10$o.paqMkaXX0mGSAuyCKorOcB3nyCOWJtn9ofto8g3cOFvWjUWxRIq	technician	2026-07-27 10:12:17.590107	\N	0115689656	2026-07-27 10:12:17.590107	\N	\N	1
2	John Mwangi	johnmwangi@gmail.com	$2b$10$0OlGRUG.cGWhARmKFLcaWuIu.nI1SpfcQlGqQ0yShQhh6r8t9dCNa	technician	2026-06-18 09:12:16.803531	P.O BOX 456	0712345681	2026-07-20 11:36:07.990103	790d494f3319c4d2b5a45f7c841fd081439f9bbac05b2e15f7982fb1d7a8659a	2026-07-20 10:24:24.822	\N
4	benny_quintine	bennyquintine@copycat.com	$2b$10$EeeMRXeY8RiNPDeygGiQxuUkl8fq.hX8mFuChR7SHYd3fLRfsXwbG	admin	2026-06-19 11:29:48.880562	P.O BOX 47320	0704274052	2026-06-29 15:22:57.707944	\N	\N	\N
12	Mary Camila	marycamila@copycat.com	$2b$10$jyH5c5M/5nQq91BQCUV6zeRiXDS0ZGa0oFGU4iHPaYv/tA0oq8qQ2	technician	2026-07-27 09:20:07.080942	P.O BOX 678	0712345681	2026-07-27 12:30:07.796774	\N	\N	1
16	teddy_charles	teddy@copycat.com	$2b$10$0s4aaN5rBT4.B/jOvGqkPevJ.0H6lss0wNSlYKZUjKQMqLnQ1FSU2	supervisor	2026-07-28 11:21:07.384333	P.O BOX 67	798536790	2026-07-28 11:21:07.384333	\N	\N	\N
8	karim_abdul	abdulkarim@copycat.com	$2b$10$2XRFbsY1CbjCC.QuCELpjOQddzHcJ4QR8zPGM/TDV9hYGCeWAi4DW	customer	2026-07-06 15:28:44.545053	P.O BOX 2345	0704274045	2026-07-06 15:35:17.984034	\N	\N	\N
17	Olivia dean	olivia@gmail.com	$2b$10$2KpI04Vr4QFE/VoxD/3Ry.PA72IEJOVeUHS.B2U7U3qWhKvOCC7Qm	technician	2026-07-28 11:24:17.344713	\N	0898765467	2026-07-28 11:24:17.344713	\N	\N	16
3	benta_obwar	bentaobwar@gmail.com	$2b$10$LWsFFaUPP3CRSXjCIPtGU.4UUTv3KlSsHKlMHk4T2i1726.V.b8iS	technician	2026-06-18 15:28:49.351975	P.O BOX 46	0727297024	2026-07-30 09:10:53.11997	f3406b1755f1e0f7a06b943eb98cc8aee5be496d3fb36335acbbc0aae2533595	2026-07-30 09:15:53.119	\N
\.


--
-- Name: jobcard_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: BentaObwar
--

SELECT pg_catalog.setval('public.jobcard_history_id_seq', 28, true);


--
-- Name: jobcards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: BentaObwar
--

SELECT pg_catalog.setval('public.jobcards_id_seq', 72, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: BentaObwar
--

SELECT pg_catalog.setval('public.users_id_seq', 17, true);


--
-- Name: jobcard_history jobcard_history_pkey; Type: CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcard_history
    ADD CONSTRAINT jobcard_history_pkey PRIMARY KEY (id);


--
-- Name: jobcards jobcards_job_number_key; Type: CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcards
    ADD CONSTRAINT jobcards_job_number_key UNIQUE (job_number);


--
-- Name: jobcards jobcards_pkey; Type: CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcards
    ADD CONSTRAINT jobcards_pkey PRIMARY KEY (id);


--
-- Name: users uq_email; Type: CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_email UNIQUE (email);


--
-- Name: jobcards uq_jobnumber; Type: CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcards
    ADD CONSTRAINT uq_jobnumber UNIQUE (job_number);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: BentaObwar
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: BentaObwar
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: users users_updated_at; Type: TRIGGER; Schema: public; Owner: BentaObwar
--

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: jobcard_history fk_customerid; Type: FK CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcard_history
    ADD CONSTRAINT fk_customerid FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jobcards fk_customerid; Type: FK CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcards
    ADD CONSTRAINT fk_customerid FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jobcard_history fk_jobcardid; Type: FK CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcard_history
    ADD CONSTRAINT fk_jobcardid FOREIGN KEY (jobcard_id) REFERENCES public.jobcards(id) ON DELETE CASCADE;


--
-- Name: jobcard_history fk_supervisorid; Type: FK CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcard_history
    ADD CONSTRAINT fk_supervisorid FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jobcard_history fk_technicianid; Type: FK CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcard_history
    ADD CONSTRAINT fk_technicianid FOREIGN KEY (technician_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jobcards fk_technicianid; Type: FK CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcards
    ADD CONSTRAINT fk_technicianid FOREIGN KEY (technician_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jobcard_history jobcard_history_jobcard_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcard_history
    ADD CONSTRAINT jobcard_history_jobcard_id_fkey FOREIGN KEY (jobcard_id) REFERENCES public.jobcards(id) ON DELETE CASCADE;


--
-- Name: jobcard_history jobcard_history_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcard_history
    ADD CONSTRAINT jobcard_history_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jobcards jobcards_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.jobcards
    ADD CONSTRAINT jobcards_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(id);


--
-- Name: users users_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: BentaObwar
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict Cv2O1xqVAjv6NcmOrIdiRoeDQzcgQo7H1juxWfNraMWJM1xeKJ2m1cF0mqadWGn

