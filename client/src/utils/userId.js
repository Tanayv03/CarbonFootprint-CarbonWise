import { v4 as uuidv4 } from 'uuid';

export const getUserId = () => {
  let userId = localStorage.getItem('carbonwise_user_id');
  
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem('carbonwise_user_id', userId);
  }
  
  return userId;
};
