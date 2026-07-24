require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const twilio = require('twilio');
const { tunnelmole } = require('tunnelmole');

async function main() {
  const port = process.env.PORT || 5000;
  console.log('🚀 Launching dedicated persistent tunnel for port', port, '...');

  try {
    const url = await tunnelmole({ port });

    console.log(`\n🌐 ═══════════════════════════════════════════════════`);
    console.log(`🌐 PERMANENT TUNNEL URL: ${url}`);
    console.log(`🌐 Webhook URL:          ${url}/api/twilio/voice`);
    console.log(`🌐 ═══════════════════════════════════════════════════\n`);

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

    if (accountSid && authToken && twimlAppSid) {
      const client = twilio(accountSid, authToken);
      await client.applications(twimlAppSid).update({
        voiceUrl: `${url}/api/twilio/voice`,
        voiceMethod: 'POST',
        statusCallback: `${url}/api/twilio/status`,
        statusCallbackMethod: 'POST',
      });
      console.log(`✅ TwiML App [${twimlAppSid}] Voice URL successfully set to: ${url}/api/twilio/voice`);
      console.log(`✅ StatusCallback set to: ${url}/api/twilio/status`);
    } else {
      console.error('❌ Twilio credentials missing in .env');
    }
  } catch (err) {
    console.error('❌ Dedicated tunnel failed:', err.message);
  }
}

main();
