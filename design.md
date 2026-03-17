AdminClassSessionManage page
- overview:
    Allow admin users to create new class sessions. They can choose the duration of the class sessions to be created. The page also provide views to existing class sessions created by the current admin user, grouped by whether they have been expired.
- layout:
    - Upper part: 
        - selection list for class session time:
            - 15min
            - 30min
            - 60 min
        - create button: trigger create new session, make a call to backend
    - Bottom part:
        - tabs: active or expired
        - vertical list view: (clickable list item, onclick, jump to AdminClassSession page)
            - col1: access code
            - col2: start time
            - col3: end time
    - nav
    
AdminClassSession page
- overview:
    Allow admin users to monitor class session uploads in real time. Admin user can view the access code of the current class session and the count down timer on the top. They can also see a list of records, each row showing the plant_type asked by the question, number of correct uploads, and number of incorrect uploads in tabular view.
- layout:
    - Upper part: 
        - label displaying the access code of current class_session
        - label displaying the remaining time (hh:mm:ss) to the end time of the current session.
    - Bottom part:
        - tabs: active or expired
        - vertical list view: (clickable list item, on click jump to )
            - col1: plant_type
            - col2: number of class session uploads that are correct (plant_answer_type === plant_type of this row, so as plant_correct_type)
            - col3: number of class session uploads that are incorrect (plant_answer_type === plant_type of this row, but plant_correct_type is not)
    - back button: go back to AdminClassSessionManage page
    - nav

AdminClassSessionResult page
- overview:
    A result display page to showcase student's performance as a group. Group and show the picture taken by students who answered correctly and incorrectly in 2 rows (scrollable view). Then a list view for each wrong answer. Teacher (admin) can click the item and expand it to see the reason the student filled in.
- layout:
    - Horizontal scrollable view displaying each picture of correct answers.
    - Vertical list view with expandable list item
        - before expand: show the correct type and name and the photo of an incorrect upload, the correct type and name should displayed under the photo, adjust font size and color.
        - after click: shows the nickname of the uploader and the reason provided. 
    - back button: go back to AdminClassSession page
    - nav


GuestHome page
- overview:
    After joining a class session, the guesthome will load the entire plant_type question set. At the top, 
    it will show the access code and the countdown timer. Under it is a question number selector, allowing students to jump around each questions. The selector allows next and previous only. nothing advanced.
    Then for each question, the screen display 2 options: capture photo or choose photo from local filesystem. If the user clicks capture photo, it will open the back camera or fallback to front camera, and get the current photo. If choose open file, allow user to select a photo. 
    Then, a text input box will be prompted out and user is required to fill in reason before submit.
    After clicking submit, it will enter the loading screen, waiting for the ai to send back results.
    After the ai send back result, show the answer to students and if they click back, they can answer next question.
- layout:
    - access code
    - count down timer
    - question selector: back : current question number : next (green means correct, red means incorrect, grey means not attempted, use the class_session_uploads records to determine this.)
    - question card:
        - plant icon
        - plant type
        - description
    - take photo button (on click jump to GuestCallengeCamera page)
    - next question


GuestChallengeCamera page
- overview:
    open camera, if click the capture button, capture current video stream. if click open file button, show file explorer. Once chosen, a modal pop out and user need to fill in a text input box for reason. then click submit button.
- layout:
    - copy existing user challenge camera is okay!
    - submit button: once submitted, jump to loading page, call guest_call_ai_model

GuestChallengeLoading page
- overview:
    a loading page. once the aiResponse is received, jump to guest answer page.

GuestChallengeAnswer page
- overview:
    a answer page that is almost exactly like the user challenge answre page. 

