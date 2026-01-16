from flask import Flask, request, jsonify
from flask_mail import Mail, Message

app = Flask(__name__)

# Email Configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'geo.intel.lab.er7@iittnif.com'
app.config['MAIL_PASSWORD'] = 'ffdc wjkx ncwa jbty'
app.config['MAIL_DEFAULT_SENDER'] = 'varshith4596@gmail.com'

mail = Mail(app)

@app.route('/send-mail', methods=['POST'])
def send_mail():
    data = request.json

    msg = Message(
        subject=data.get('subject', 'Flask Mail'),
        recipients=[data['to']],
        body=data.get('message')
    )

    mail.send(msg)
    return jsonify({"status": "Email sent successfully!"})

if __name__ == '__main__':
    app.run(debug=True)
