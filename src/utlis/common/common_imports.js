import express from 'express';
import path,{dirname} from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import csrf from 'csurf';
import flash from 'connect-flash';
import session from 'express-session';
import hbs from 'express-handlebars';
import configKeys from '../../configkeys.js'

export{
    express,
    path,dirname,
    fileURLToPath,
    cookieParser,
    logger,
    cors,
    csrf,
    flash,
    session,
    hbs,
    configKeys,
}