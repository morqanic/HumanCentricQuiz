I want to create a website that:
- gives people a series of questions 
- once all questions are completed, saves results 
- has results available for me to view

The tech stack should be React for frontend, supabase for backend and Vercel for hosting.

there is example questions in input.json. Users should randomly recieve the control or random input.

Styling should make it look like a user is responding to a message on a phone. The website should work on both laptop and mobile.

Each user should get 7 questions, however for each individual question, if they get control or treatment is random.

Results view can jus tbe a simple table.

At the start, each user has a fake $50

Each question will have a 15second timer to respond (yes or no) where money is detracted accordingly (if timer runs out, assume no). 
For questions with a second part, they should have a longer timer. Or for questions with a shorter time up, there should be a warning before hand that there is less time.

All questions form input.json should be used. For sequential questions 

Each new question should have a different pastel theming on the phone to the previous question.

At the bottom of the phone should be a decline and accept (which means you take cost or not).
Each question has 10 second limit (if time limit up, decline is chosen for user). Some questions have time_limit_seconds in which case the time limit should be that (eg 5 seconds).

There should first be a page telling the user about the experiment and explaining to give money to worthy people

Input is:
input.json

Output is:
output.json

