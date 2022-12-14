import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext =  React.createContext();

const GithubProvider = ({children}) => {
   const [githubUser,setGithubUser] = useState(mockUser);
   const [repos,setRepos] = useState(mockRepos);
   const [followers,setFollowers] = useState(mockFollowers);
  // request loading

  const [requests,setRequests] = useState(0);
  const [isLoading,setIsloading] = useState(false);

  // error
  const [error,setError] = useState({show:false,msg:""})

   const searchGithubUser = async (user) => {
      toggleError();
      setIsloading(true);
      const response = await axios(`${rootUrl}/users/${user}`).catch(err => console.log(err))
    
      if(response){
         setGithubUser(response.data);
         const {login,followers_url} = response.data
         // more logic here
         //repos
          axios(`${rootUrl}/users/${login}/repos?per_pages=100`).then((response) => {
              setRepos(response.data);
         })
         //https://api.github.com/users/john-smilga/repos?per_page=100
         //followers
          axios(`${followers_url}?per_pages=100`).then((response) => {
              setFollowers(response.data);
         })
         //https://api.github.com/users/john-smilga/followers
      }else{
         toggleError(true,'there is no user with that username!')
      }
       chechRequests();
       setIsloading(false);

   }

  // check rate
  const chechRequests = () => {

     axios(`${rootUrl}/rate_limit`)
       .then(({data}) => {
          let {rate:{remaining},} = data;

          setRequests(remaining);
          if(remaining === 0){
            toggleError(true,'sorry, you have exceeded your hourly rate limit!')
          }
       })
       .catch((err) => console.log(err));
  }

  function toggleError(show = false,msg = ''){
     setError({show,msg});
  }
  
  useEffect(chechRequests,[]);



   return <GithubContext.Provider value={{githubUser,requests,repos,followers,searchGithubUser,error,isLoading}}>{children}</GithubContext.Provider>
}

export {GithubProvider,GithubContext};
