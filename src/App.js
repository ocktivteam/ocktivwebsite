import './App.css';
import React from 'react';
import Homepage from "./components/homepage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EnrolledProgram from "./components/EnrolledProgram";
import CourseContent from "./components/CourseContent";
import Content from "./components/Content";
import Video from './components/video';
import News from "./components/news";
import Evaluation from './components/evaluation';
import Grades from './components/Grades';
import Discussion from './components/Discussion';
import Groups from './components/Groups';
import Messages from './components/messages';
import NewMessage from './components/NewMessage';
import Finance from './components/Finance';
import Academics from './components/academicsHome';
import ViewFees from './components/ViewFees';
import Signup from './components/signup';
import Login from './components/login';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import AllCourses from "./components/allcourses";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/courses" element={<AllCourses />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/course-shell" element={<EnrolledProgram />} />
        <Route path="/course-content" element={<CourseContent />} />
        <Route path="/course/:courseId" element={<Content />} />
        <Route path="/video" element={<Video />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/new-message" element={<NewMessage />} />
        <Route path="/Finance" element={<Finance />} />
        <Route path="/view-fees" element={<ViewFees />} />
        <Route path="/academics" element={<Academics />} />
        <Route path="/news" element={<News />} />
        <Route path="/evaluation" element={<Evaluation />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/discussion" element={<Discussion />} />
        <Route path="/groups" element={<Groups />} />
      </Routes>
    </Router>
  );
}

export default App;