const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firestore);
const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });





exports.sendNotification = functions.firestore.document("Yaya_Employer/{User_Id}/Notifications/{notification_id}")
    .onWrite((change, event) => {



        const User_Id = event.params.User_Id;
        const notification_id = event.params.notification_id;

        console.log("we have a new Notification to", User_Id + "  |  " + notification_id);

        return admin.firestore().collection("Yaya_Employer").doc(User_Id).collection("Notifications")
            .doc(notification_id).get().then(quertResult => {


                const from_user_id = quertResult.data().from;
                const message = quertResult.data().desc;
                const bUiD = quertResult.data().to;

                const from_data = admin.firestore().collection("Yaya_Bureau").doc(bUiD).get();
                const to_data = admin.firestore().collection("Yaya_Employer").doc(from_user_id).get();


                return Promise.all([from_data, to_data]).then(result => {

                    const from_name = result[0].data().Name;
                    const to_name = result[1].data().Name;
                    const token_id = result[0].data().device_token;



                    console.log("Message from :  " + from_name + "  Sent To:  " + to_name);


                    const payload = {
                        notification: {

                            title: "Confirmed deal",
                            body: message,
                            icon: "default",
                            click_action: "com.intech.yayabureau.TARGETNOTIFICATIONS"

                        },
                        data: {
                            title: "Confirmed deal",
                            message: message,
                            order_id: from_user_id
                        }

                    };


                    return admin.messaging().sendToDevice(token_id, payload).then(result => {


                        console.log("Sent To:  " + token_id);


                    });




                });


            });




    });