const sgMail = require('@sendgrid/mail')

const sendGridAPIKey = process.env.SENDGRID_API_KEY
sgMail.setApiKey(sendGridAPIKey);


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to:email,
        from:'brat.tabusao@gmail.com',
        subject:'Welcome to the app',
        text:`Welcome to the app ${name}. Enjoy :)`,
    })
    
}


const sendCancellation = (email, args) =>{
    sgMail.send({
        to:email,
        from:'brat.tabusao@gmail.com',
        subject:'Thank you!',
        text:`Hi ${args}. Why you cancelled your subscription? You can back if you want to continue. Thank for using the app have a good day!`,
    })
}
module.exports = {
    sendWelcomeEmail,
    sendCancellation
}