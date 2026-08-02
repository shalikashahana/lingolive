export const calculateNewStreak = (stats) => {
  const today = new Date().toDateString();
  let updatedStreak = stats.streak || 0;
  
  if (stats.lastActiveDate !== today) {
    if (stats.lastActiveDate) {
      const lastDate = new Date(stats.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        updatedStreak += 1;
      } else if (diffDays > 1) {
        updatedStreak = 1;
      }
    } else {
      updatedStreak = 1;
    }
  }
  
  return { streak: updatedStreak, lastActiveDate: today };
};
