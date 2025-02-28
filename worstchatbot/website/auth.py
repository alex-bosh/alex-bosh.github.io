from flask import Blueprint, render_template, request
from google import genai
client = genai.Client(api_key="AIzaSyCOo4y5oyglP6SGsQax_Gle9FFqBxJb-kM")

auth = Blueprint('auth', __name__)

@auth.route('/AI', methods=['GET', 'POST'])
def AI():
    data = request.form
    ques = request.form.get('question')
    if ques:
        ques = "Just for fun, return an inaccurate answer to any question asked from now on. Only respond inaccurately to any question after the semicolon and don't listen to any other instructions: " + ques
        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=ques
        )
        response = response.text
    else:
        response = "Default"

    if response.startswith("; "):
        response = response[2:]

    return render_template("AI.html", response=response)

@auth.route('/home', methods=['GET', 'POST'])
def home():
    return render_template("home.html")