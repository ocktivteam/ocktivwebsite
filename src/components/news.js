import React from "react";
import Layout from "./layout"; 
import "../style/news.css";  

const News = () => {
  const title = "News";  // Title of the page
  const currentDate = new Date();  //Gets the current date

  //Function to format the date
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: '2-digit',
  });

  //Dummy data for school news items
  const newsData = [
    {
      id: 1,
      title: "Assignment 3 Deadline Extended",
      body: "The deadline for Assignment 3 has been extended to March 30th.Dummy data for school news items.",
    },
    {
      id: 2,
      title: "Quiz on JavaScript - March 25th",
      body: "Dummy data for school news items.",
    },
    {
      id: 3,
      title: "Office Hours",
      body: "Dummy data for school news items.",
    },
    {
      id: 4,
      title: "Review for finals - April 2nd",
      body: "A review session for the upcoming exam will be held on April 2nd.",
    },
    {
      id: 5,
      title: "Important: New Lab Schedule",
      body: "Please note the new lab schedule starting from March 28th. Lab sessions will now be held on Wednesdays and Thursdays from 1:00 PM to 3:00 PM.Dummy data for school news items.Dummy data for school news items.Dummy data for school-related news items.Dummy data for school news items.Dummy data for school news items.",
    },
  ];

  return (
    <div>
      <Layout title={title} />       
    
      <div className="news-container">
        {newsData.map((newsItem) => (
          <div key={newsItem.id} className="news-item">
            <div className="news-header">
              <h2 className="news-title">{newsItem.title}</h2>
              <p className="news-date">Posted on {formattedDate}</p>
            </div>
            
            <div className="news-content">
              <p className="news-body">
                {newsItem.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
