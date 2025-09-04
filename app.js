"use strict"

const quizData = [
    {
        question: "Which HTML tag is used to define the largest heading?",
        options: ["<h1>", "<h2>", "<h3>", "<h4>"],
        correct: 0
    },
    {
        question: "Which CSS property is used to change the text color of an element?",
        options: ["font-color", "text-style", "color", "text-color"],
        correct: 2
    },
    {
        question: "What is the correct way to write a JavaScript array?",
        options: [
            "const colors = (red, green, blue)",
            'const colors = "red, green, blue"',
            "const colors = [red, green, blue]",
            'const colors = ["red", "green", "blue"]'
        ],
        correct: 3
    },
    {
        question: "What does CSS stand for?",
        options: [
            "Computer Style Sheets",
            "Cascading Style Sheets",
            "Creative Style System",
            "Colorful Style Sheets"
        ],
        correct: 1
    },

    {
        question: "Which CSS property controls the size of text?",
        options: ["font-size", "text-style", "font-weight", "text-size"],
        correct: 0
    },
    {
        question: "How do you write 'Hello World' in an alert box in JavaScript?",
        options: [
            "msg('Hello World')",
            "alertBox('Hello World')",
            "alert('Hello World')",
            "console.log('Hello World')"
        ],
        correct: 3
    }

];


// document elements

const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const resultElement = document.getElementById("result");
const progressBar = document.getElementById("progress-bar");
const questionNumber = document.getElementById("question-number");
const timerElement = document.getElementById("timer-text");
const startBtn = document.getElementById("start-btn")


const quizScreen = document.querySelector(".quiz-screen");
const welcomeScreen = document.querySelector(".welcome-screen");
const resultScreen = document.getElementById("result");


// randomizing part of the question

let questions = [...quizData].sort(() => Math.random() - 0.5)
let currentQuestion = 0;
let score = 0
let timer;
let timeLeft;

// to save the quiz state in local staorage
function saveQuizState() {
    const state = {
        currentQuestion,
        score,
        timeLeft,
        questions
    };
    localStorage.setItem("quizState", JSON.stringify(state));
}

function startQuiz() {
    welcomeScreen.classList.remove("active");
    quizScreen.classList.add("active");
    loadQuestion();
    updateProgress()
}

//  Load Question
function loadQuestion() {

    //clearing the time interval
    clearInterval(timer)
    timeLeft = 15//seconds for each question
    updateTimer()
    timer = setInterval(countdown, 1000)

    let q = questions[currentQuestion];
    questionElement.textContent = `Q${currentQuestion + 1}. ${q.question}`;

    optionsElement.innerHTML = ""; // clear old options

    q.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.classList.add("option-btn");
        btn.textContent = option;
        btn.addEventListener("click", () => selectAnswer(index, true));
        optionsElement.appendChild(btn);
    });

    // to save the quiz state
    saveQuizState()

    nextBtn.style.display = "none";// hide next until answer choosen
    updateProgress()

}

// fuction for timer

function countdown() {
    timeLeft--;

    updateTimer()
    if (timeLeft === 0) {
        clearInterval(timer)
        selectAnswer(questions[currentQuestion]?.correct, false) //seleting the answer atomatically
    }
}

function updateTimer() {
    timerElement.textContent = `⏰ ${timeLeft} seconds`

    saveQuizState()
}

// select answer options
function selectAnswer(index, shouldScore) {

    let q = questions[currentQuestion];
    const buttons = document.querySelectorAll(".option-btn")

    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = "none";  // to prevent after u have click one button
    });

    if (index === q.correct) {
        buttons[index].classList.add("correct")
        shouldScore && score++;
    } else {
        buttons[index].classList.add("wrong")
        buttons[q.correct].classList.add("correct")  //given the correct answer if u slect the wrong one
    }

    // if it's the last question, show the result button
    if (currentQuestion === questions.length - 1) {
        nextBtn.style.display = "none";

        const resultBtn = document.createElement("button");
        resultBtn.textContent = "Show Result";
        resultBtn.classList.add("result-btn");
        nextBtn.parentElement.appendChild(resultBtn);

        resultBtn.addEventListener("click", showRelsult);
    } else {
        nextBtn.style.display = "inline-block";
    }

    saveQuizState()

}

//next button and start button
startBtn.addEventListener("click", startQuiz);


nextBtn.addEventListener("click", () => {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        loadQuestion()
    } else {
        showRelsult()
    }
})


function showRelsult() {

    nextBtn.style.display = "none";
    quizScreen.classList.remove("active");
    resultScreen.classList.add("active");

    const highScore = parseInt(localStorage.getItem("QuizHighScore")) || 0;

    const isNew = score > highScore

    if (isNew) {
        localStorage.setItem("QuizHighScore", score)
    }

    resultElement.innerHTML = `
    <h2>hurry!! Quiz completed</h2>
    <p>you have scored ${score} out of ${questions.length}</p>
      <p>Highest score: ${Math.max(score, highScore)}</p>

     <button id="restart-btn">RESTART QUIZ</button>
    `

    document.getElementById("restart-btn").addEventListener("click", restartQuiz);

}

function restartQuiz() {
    welcomeScreen.classList.add("active");
    resultScreen.classList.remove("active");

    const resultBtn = document.querySelector(".result-btn");

    if (resultBtn) {
        resultBtn.remove();
    }

    //to clear my local storage so that the quiz can start again
    localStorage.setItem("QuizHighScore", 0);
    // localStorage.setItem("QuizHighScore");

    localStorage.removeItem("quizState");
    questions = [...quizData].sort(() => Math.random() - 0.5);
    currentQuestion = 0;
    score = 0;
}


function updateProgress() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    progressBar.style.width = progress + "%";
    questionNumber.textContent = `${currentQuestion + 1} / ${questions.length}`;
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

        loadQuestion(); // continue quiz
    }
});
