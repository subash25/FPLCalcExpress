# FPLCalcExpress
Deployed code on Heroku

run command "node app" to strt the application.


DDL commands for postgres tables

-- Name: captainsubtable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.captainsubtable (
    league character varying(5) NOT NULL,
    gameweek numeric NOT NULL,
    data json
);


ALTER TABLE public.captainsubtable OWNER TO postgres;

--
-- Name: fixturetable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fixturetable (
    league character varying(5) NOT NULL,
    hometeam character varying(50) NOT NULL,
    gameweek numeric NOT NULL,
    awayteam character varying(50) NOT NULL
);


ALTER TABLE public.fixturetable OWNER TO postgres;

--
-- Name: gwpoints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gwpoints (
    league character varying(5) NOT NULL,
    gameweek numeric NOT NULL,
    team character varying(50) NOT NULL,
    points numeric
);


ALTER TABLE public.gwpoints OWNER TO postgres;

--
-- Name: gwresultnew; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gwresultnew (
    league character varying(5) NOT NULL,
    gameweek numeric NOT NULL,
    team character varying(50) NOT NULL,
    won numeric,
    lost numeric,
    draw numeric,
    pf numeric,
    pa numeric,
    gd numeric,
    points numeric,
    curpos numeric,
    prevpos numeric
);


ALTER TABLE public.gwresultnew OWNER TO postgres;

--
-- Name: gwresults; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gwresults (
    league character varying(5) NOT NULL,
    gameweek numeric NOT NULL,
    team character varying(50) NOT NULL,
    result "char" NOT NULL,
    pointdiff numeric
);


ALTER TABLE public.gwresults OWNER TO postgres;

--
-- Name: playerdata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playerdata (
    league character varying(5),
    teamname character varying(50),
    playername character varying(50),
    playerid numeric,
    isactive character varying(3) DEFAULT 'Y'::character varying
);


ALTER TABLE public.playerdata OWNER TO postgres;

--
-- Name: playerpoints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playerpoints (
    league character varying(5) NOT NULL,
    gameweek numeric NOT NULL,
    teamname character varying(50),
    teamid numeric,
    points numeric
);


ALTER TABLE public.playerpoints OWNER TO postgres;

--
-- Name: teamdata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teamdata (
    league character varying(5),
    teamname character varying(50),
    password character varying(25)
);


ALTER TABLE public.teamdata OWNER TO postgres;

--
-- Name: utility; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utility (
    key character varying(20) NOT NULL,
    value text NOT NULL,
    param character varying(20) NOT NULL
);


ALTER TABLE public.utility OWNER TO postgres;

--
-- Data for Name: captainsubtable; Type: TABLE DATA; Schema: public; Owner: postgres
--