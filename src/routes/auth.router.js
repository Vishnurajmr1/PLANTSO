import express from 'express';
import authController from '../controllers/authController'
const router=express.Router();

router.route('/login').get((req,res)=>{}).post((req,res,next)=>{next(new Error('not implemented'))})