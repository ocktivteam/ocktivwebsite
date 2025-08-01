import React, { useState } from "react";
import "../style/createQuiz.css";
import {
    Box,
    Typography,
    OutlinedInput,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    RadioGroup,
    FormControlLabel,
    Radio,
    Select,
    MenuItem,
} from "@mui/material";

const dummyQuestions = [
    {
        id: 1,
        text: "What is the capital of Ontario?",
        options: ["a. Answer 1", "b. Answer 2", "c. Answer 3", "d. Answer 4"],
        correct: "b. Answer 2",
        points: 1,
    },
    {
        id: 2,
        text: "What is 2 + 2?",
        options: ["a. 3", "b. 4", "c. 5", "d. 6"],
        correct: "b. 4",
        points: 1,
    },
    {
        id: 3,
        text: "Which is a programming language?",
        options: ["a. HTML", "b. CSS", "c. Python", "d. UI"],
        correct: "c. Python",
        points: 1,
    },
    {
        id: 4,
        text: "React is a ____?",
        options: ["a. Framework", "b. Library", "c. Language", "d. Compiler"],
        correct: "b. Library",
        points: 1,
    },
    {
        id: 5,
        text: "What does CPU stand for?",
        options: ["a. Central Process Unit", "b. Central Processing Unit", "c. Computer Personal Unit", "d. Control Processing Unit"],
        correct: "b. Central Processing Unit",
        points: 1,
    },
    {
        id: 6,
        text: "Which tag is used to define a hyperlink in HTML?",
        options: ["a. <a>", "b. <link>", "c. <href>", "d. <url>"],
        correct: "a. <a>",
        points: 1,
    },
    {
        id: 7,
        text: "What is the output of 3 * '3' in JavaScript?",
        options: ["a. 9", "b. '333'", "c. 3", "d. Error"],
        correct: "a. 9",
        points: 1,
    },
    {
        id: 8,
        text: "Which of the following is a NoSQL database?",
        options: ["a. PostgreSQL", "b. MySQL", "c. MongoDB", "d. Oracle"],
        correct: "c. MongoDB",
        points: 1,
    },
];

export default function CreateQuiz() {
    const [quizTitle, setQuizTitle] = useState("");
    const [totalPoints, setTotalPoints] = useState("15");
    const [selectedQ, setSelectedQ] = useState(dummyQuestions[3]); // default Q4

    return (
        <div className="create-quiz-container">
            <div className="create-quiz-form">
                <Typography variant="h6" fontWeight={700} sx={{ color: "#1664b6", mb: 2 }}>
                    Quiz Title <span style={{ color: "red" }}>*</span>
                </Typography>

                <OutlinedInput
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    fullWidth
                    placeholder="Enter quiz title"
                    sx={{
                        background: "#fff",
                        borderRadius: "8px",
                        mb: 3,
                        fontWeight: 500,
                    }}
                />

                <Typography variant="h6" fontWeight={700} sx={{ color: "#1664b6", mb: 2 }}>
                    Total points <span style={{ color: "red" }}>*</span>
                </Typography>

                <OutlinedInput
                    value={totalPoints}
                    onChange={(e) => setTotalPoints(e.target.value)}
                    fullWidth
                    sx={{
                        background: "#fff",
                        borderRadius: "8px",
                        mb: 4,
                        fontWeight: 500,
                    }}
                />

                <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: "#1664b6", mb: 2 }}
                >
                    Questions
                </Typography>

                {/* Show dropdown only on mobile */}
                <Box sx={{ display: { xs: "block", md: "none" }, mb: 2 }}>
                    <Select
                        value={`Q${selectedQ.id}`}
                        onChange={(e) => {
                            const qId = parseInt(e.target.value.replace("Q", ""));
                            const newQ = dummyQuestions.find((q) => q.id === qId);
                            setSelectedQ(newQ);
                        }}
                        fullWidth
                        size="small"
                        sx={{
                            fontSize: "0.95rem",
                            height: "38px",
                            background: "#fff",
                            borderRadius: "6px",
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    maxHeight: 250,
                                    fontSize: "0.92rem", // smaller font for dropdown items
                                },
                            },
                        }}
                    >
                        {dummyQuestions.map((q) => (
                            <MenuItem
                                key={q.id}
                                value={`Q${q.id}`}
                                sx={{ fontSize: "0.92rem", py: 0.8 }} // reduce padding
                            >
                                {`Q${q.id}`}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                <div className="quiz-question-section">
                    <Paper
                        elevation={0}
                        className="quiz-question-list"
                    >
                        <List dense>
                            {dummyQuestions.map((q) => (
                                <ListItem
                                    key={q.id}
                                    button
                                    selected={selectedQ.id === q.id}
                                    onClick={() => setSelectedQ(q)}
                                    sx={{
                                        borderBottom: "1px solid #ccc",
                                        textAlign: "center",
                                        py: 1,
                                    }}
                                >
                                    <ListItemText primary={`Q${q.id}`} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>

                    <Paper
                        elevation={0}
                        className="quiz-question-preview"
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography fontWeight={700}>{`Q${selectedQ.id}`}</Typography>
                            <Typography fontWeight={500}>{`${selectedQ.points} point`}</Typography>
                        </Box>
                        <Typography mb={2}>{selectedQ.text}</Typography>
                        <RadioGroup>
                            {selectedQ.options.map((opt, i) => (
                                <FormControlLabel
                                    key={i}
                                    value={opt}
                                    control={<Radio />}
                                    label={opt}
                                />
                            ))}
                        </RadioGroup>
                    </Paper>
                </div>
                <button className="create-quiz-submit-btn">Create</button>
            </div>
        </div>
    );
}  