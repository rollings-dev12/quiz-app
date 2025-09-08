
"use strict";

// document elements
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const resultElement = document.getElementById("result");
const progressBar = document.getElementById("progress-bar");
const questionNumber = document.getElementById("question-number");
const timerElement = document.getElementById("timer-text");
const startBtn = document.getElementById("start-btn");

const quizScreen = document.querySelector(".quiz-screen");
const welcomeScreen = document.querySelector(".welcome-screen");
const resultScreen = document.getElementById("result");

let questions = [];
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft;
let answered = false; //  guard to prevent double taps

// fetch questions from API
async function fetchQuestions() {
    try {
        const res = await fetch("https://opentdb.com/api.php?amount=5&category=18&type=multiple");
        const data = await res.json();

        // format API data
        questions = data.results.map((q) => {
            const options = [...q.incorrect_answers];
            const correctIndex = Math.floor(Math.random() * (options.length + 1));
            options.splice(correctIndex, 0, q.correct_answer);

            return {
                question: q.question,
                options,
                correct: correctIndex
            };
        });

        startQuiz();
    } catch (err) {
        console.error("Failed to fetch questions:", err);
        questionElement.textContent = " Could not load questions. Try again later.";
    }
}

function startQuiz() {
    welcomeScreen.classList.remove("active");
    quizScreen.classList.add("active");
    currentQuestion = 0;
    score = 0;
    loadQuestion();
    updateProgress();
}

// load question
function loadQuestion() {
    answered = false; // reset guard
    clearInterval(timer);
    timeLeft = 15;
    updateTimer();
    timer = setInterval(countdown, 1000);

    let q = questions[currentQuestion];
    questionElement.innerHTML = `Q${currentQuestion + 1}. ${q.question}`;

    //removing the pervious options
    optionsElement.innerHTML = "";

    // 🛠️ Reset leftover buttons
    nextBtn.style.display = "none";
    const oldResultBtn = document.querySelector(".result-btn");
    if (oldResultBtn) oldResultBtn.remove();

    q.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.classList.add("option-btn");
        btn.innerHTML = option;


        // use pointerup instead of click
        btn.addEventListener("pointerup", () => selectAnswer(index, true));
        optionsElement.appendChild(btn);
    });

    updateProgress();
}

// timer countdown
function countdown() {
    timeLeft--;
    updateTimer();

    if (timeLeft === 0) {
        clearInterval(timer);

        //  disable buttons immediately
        const buttons = document.querySelectorAll(".option-btn");
        buttons.forEach(btn => btn.disabled = true);

        selectAnswer(questions[currentQuestion]?.correct, false);

        // auto move
        setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < questions.length) {
                loadQuestion();
            } else {
                showResult();
            }
        }, 1000);
    }
}

function updateTimer() {
    timerElement.textContent = `⏰ ${timeLeft} seconds`;

    saveQuizState()
}

// select answer
function selectAnswer(index, shouldScore) {
    saveQuizState()
    if (answered) return; // prevent double tap
    answered = true;

    let q = questions[currentQuestion];
    const buttons = document.querySelectorAll(".option-btn");

    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = "none";
    });

    if (index === q.correct) {
        buttons[index].classList.add("correct");
        if (shouldScore) score++;
    } else {
        if (buttons[index]) buttons[index].classList.add("wrong");
        buttons[q.correct].classList.add("correct");
    }

    if (shouldScore) {
        if (currentQuestion === questions.length - 1) {
            const resultBtn = document.createElement("button");
            resultBtn.textContent = "Show Result";
            resultBtn.classList.add("result-btn");
            nextBtn.parentElement.appendChild(resultBtn);

            //to remove doubble click thats why i used the pointerup event
            resultBtn.addEventListener("pointerup", showResult);
        } else {
            nextBtn.style.display = "inline-block";
        }
    }
}

// next button
nextBtn.addEventListener("pointerup", () => {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
});


function showResult() {
    quizScreen.classList.remove("active");
    resultScreen.classList.add("active");

    const totalScore = score * 2; //  each question worth 2 points

    resultElement.innerHTML = `
    <h2>🎉 Quiz completed!</h2>
    <p>You answered ${score} out of ${questions.length} correctly</p>
    <p>Total Score: <strong>${totalScore}</strong></p>
    <button id="restart-btn">RESTART QUIZ</button>
    `;

    document.getElementById("restart-btn").addEventListener("pointerup", restartQuiz);
}




function restartQuiz() {
    welcomeScreen.classList.add("active");
    resultScreen.classList.remove("active");

    //  Remove leftover buttons
    nextBtn.style.display = "none";
    const oldResultBtn = document.querySelector(".result-btn");
    if (oldResultBtn) oldResultBtn.remove();

    questions = [];
    currentQuestion = 0;
    score = 0;


    //clearing the local storage
    localStorage.removeItem("quizState");


}

// update progress
function updateProgress() {
    if (questions.length > 0) {
        const progress = ((currentQuestion + 1) / questions.length) * 100;
        progressBar.style.width = progress + "%";
        questionNumber.textContent = `${currentQuestion + 1} / ${questions.length}`;
    } else {
        progressBar.style.width = "0%";
        questionNumber.textContent = "0 / 0";
    }
}

// start button
startBtn.addEventListener("pointerup", fetchQuestions);


//  to save the question in local storage

function saveQuizState() {
    const state = {
        currentQuestion,
        score,
        timeLeft,
        questions
    };
    localStorage.setItem("quizState", JSON.stringify(state));
}


window.addEventListener("load", () => {
    const savedState = localStorage.getItem("quizState");

    if (savedState) {
        const state = JSON.parse(savedState);
        questions = state.questions;
        currentQuestion = state.currentQuestion;
        score = state.score;
        timeLeft = state.timeLeft;

        welcomeScreen.classList.remove("active");
        quizScreen.classList.add("active");

        loadQuestion(); // to continue from the save question
    }
});
