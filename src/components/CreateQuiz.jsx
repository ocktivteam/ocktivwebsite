import React, { useState } from "react";
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
];

export default function CreateQuiz() {
  const [quizTitle, setQuizTitle] = useState("");
  const [totalPoints, setTotalPoints] = useState("15");
  const [selectedQ, setSelectedQ] = useState(dummyQuestions[3]); // default Q4

  return (
    <Box
      sx={{
        background: "#f7f7f7",
        borderRadius: "12px",
        p: { xs: 2, md: 4 },
        maxWidth: "1100px",
        mx: "auto",
        mt: 4,
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={2}>
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

      <Typography variant="h6" fontWeight={700} mb={1}>
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

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          background: "#eaeaea",
          borderRadius: "12px",
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "120px",
            background: "#fff",
            borderRadius: "6px",
            overflow: "auto",
            maxHeight: "300px",
          }}
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
          sx={{
            flex: 1,
            background: "#fff",
            borderRadius: "6px",
            p: 2,
            minWidth: "250px",
            borderTop: "5px solid #90caf9",
          }}
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
                // disabled
              />
            ))}
          </RadioGroup>
        </Paper>
      </Box>

      <Button
        variant="contained"
        sx={{
          mt: 4,
          display: "block",
          mx: "auto",
          px: 6,
          py: 1.5,
          fontWeight: 700,
          fontSize: "1rem",
          borderRadius: "8px",
          backgroundColor: "#1664b6",
        }}
      >
        Create
      </Button>
    </Box>
  );
}
