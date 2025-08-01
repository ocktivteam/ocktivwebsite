import './App.css';
import React from 'react';
import Homepage from "./components/homepage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EnrolledProgram from "./components/EnrolledProgram";
import CourseContent from "./components/CourseContent";
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
import Payment from "./components/payment";
import CourseDetails from "./components/coursedetails";
import SessionManager from "./components/SessionManager";
import Content from "./components/content";
import AllContent from "./components/allContent";
import QuizPage from './components/QuizPage';
import CertificateTab from "./components/CertificateTab";
import CertificateViewer from "./components/CertificateViewer";
import Assignment from './components/Assignment';
import AdminDashboard from "./components/AdminDashboard";
import AdminTabs from "./components/AdminTabs";
import CreateCourseForm from './components/CreateCourseForm';
import RegisterInstructorForm from './components/RegisterInstructorForm';
import InstructorTabs from "./components/InstructorTabs";
import AdminDashboardNavbar from "./components/adminDashboardNavbar"; 
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes: do NOT wrap */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        <Route path="/admin-dashboard" element={
  <AdminRoute>
    <SessionManager>
      <AdminDashboard />
    </SessionManager>
  </AdminRoute>
} />
        {/* Protected routes: wrap with SessionManager */}
        <Route path="/courses" element={
          <SessionManager><AllCourses /></SessionManager>
        } />
        <Route path="/coursedetails/:id" element={
          <SessionManager><CourseDetails /></SessionManager>
        } />
        <Route path="/payment" element={
          <SessionManager><Payment /></SessionManager>
        } />
        <Route path="/home" element={
          <SessionManager><Homepage /></SessionManager>
        } />
        <Route path="/course-shell" element={
          <SessionManager><EnrolledProgram /></SessionManager>
        } />
        {/* Student view: */}
        <Route path="/course-content/:courseId" element={
          <SessionManager><AllContent readOnly={true} /></SessionManager>
        } />

        {/* Instructor view (module list/sidebar/plus) */}
        <Route path="/course/:courseId" element={
          <SessionManager><AllContent /></SessionManager>
        } />

        {/* Create NEW module */}
        <Route path="/course/:courseId/content" element={
          <SessionManager><Content /></SessionManager>
        } />

        {/* Edit module */}
        <Route path="/course/:courseId/content/:moduleId" element={
          <SessionManager><Content /></SessionManager>
        } />

        {/* Miscellaneous routes */}
        <Route path="/video" element={
          <SessionManager><Video /></SessionManager>
        } />
        <Route path="/messages" element={
          <SessionManager><Messages /></SessionManager>
        } />
        <Route path="/new-message" element={
          <SessionManager><NewMessage /></SessionManager>
        } />
        <Route path="/Finance" element={
          <SessionManager><Finance /></SessionManager>
        } />
        <Route path="/view-fees" element={
          <SessionManager><ViewFees /></SessionManager>
        } />
        <Route path="/academics" element={
          <SessionManager><Academics /></SessionManager>
        } />
        <Route path="/news" element={
          <SessionManager><News /></SessionManager>
        } />
        {/* <Route path="/evaluation" element={
          <SessionManager><Evaluation /></SessionManager>
        } /> */}
        <Route path="/course/:courseId/assignment"  element={
          <SessionManager><Assignment /></SessionManager>
        } />
        <Route path="/grades" element={
          <SessionManager><Grades /></SessionManager>
        } />
        <Route path="/discussion" element={
          <SessionManager><Discussion /></SessionManager>
        } />
        <Route path="/groups" element={
          <SessionManager><Groups /></SessionManager>
        } />
         <Route path="/certificates/:certId" element={<CertificateViewer />} />
 <Route path="/course-content/:courseId/quiz/:quizId" element={
          <SessionManager><QuizPage /></SessionManager>
        } />
<Route path="/admin/create" element={
  <AdminRoute>
    <SessionManager>
      <AdminTabs />
    </SessionManager>
  </AdminRoute>
} />
            {/* Edit course */}
            <Route path="/admin/edit-course/:id" element={
  <AdminRoute>
    <SessionManager>
      <>
        <AdminDashboardNavbar />
        <CreateCourseForm />
      </>
    </SessionManager>
  </AdminRoute>
} />

<Route path="/admin/edit-instructor/:id" element={
  <AdminRoute>
    <SessionManager>
      <>
        <AdminDashboardNavbar />
        <RegisterInstructorForm />
      </>
    </SessionManager>
  </AdminRoute>
} />

<Route path="/instructor-tools/:courseId" element={
  <SessionManager><InstructorTabs /></SessionManager>
} />
      </Routes>
    </Router>
  );
}

export default App;