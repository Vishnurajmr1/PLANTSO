import * as Twilio from "twilio";
import configKeys from "../configkeys.js";
import constants from "../utlis/constants.js";
const accountSid = configKeys.TWILIO_ACCOUNT_SID;
const authToken = configKeys.TWILIO_AUTH_TOKEN;
const serviceSid = configKeys.TWILIO_SERVICES_SID;
const client = Twilio(accountSid, authToken);

async function sendOtp(ISO, phoneNumber) {
  try {
    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({ to: ISO + phoneNumber, channel: "sms" });
    if (verification) {
      console.log(verification.sid);
      return true;
    }
  } catch (error) {
    throw new Error(error);
    // return false;
  }
}

async function verifyOtp(ISO, phoneNumber, otp) {
  try {
    const verificationChecks = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: ISO, phoneNumber, code: otp });
    verificationChecks.status === constants.APPROVED ? true : false;
  } catch (error) {
    throw new Error(error);
  }
}

export { sendOtp, verifyOtp };
