export function gradeAnswer(question: any, studentAnswer: any) {
  let isCorrect = false;
  let pointsEarned = 0;

  if (!studentAnswer) return { isCorrect, pointsEarned };

  switch (question.type) {
    case 'matching':
      if (typeof studentAnswer === 'object' && question.correctAnswer) {
        let correctCount = 0;
        const keys = Object.keys(question.correctAnswer);
        keys.forEach((key) => {
          if (studentAnswer[key]?.trim().toUpperCase() === question.correctAnswer[key]?.trim().toUpperCase()) {
            correctCount++;
          }
        });
        pointsEarned = correctCount; // 1 point per match as per AGENTS.md
        isCorrect = correctCount === keys.length;
      }
      break;

    case 'multiple_choice':
      if (typeof studentAnswer === 'string' && typeof question.correctAnswer === 'string') {
        isCorrect = studentAnswer.trim().toUpperCase() === question.correctAnswer.trim().toUpperCase();
        pointsEarned = isCorrect ? 1 : 0;
      }
      break;

    case 'multiple_response':
      if (typeof studentAnswer === 'string' && typeof question.correctAnswer === 'string') {
        isCorrect = studentAnswer.trim().toUpperCase() === question.correctAnswer.trim().toUpperCase();
        pointsEarned = isCorrect ? 1 : 0;
      }
      break;

    case 'essay':
      isCorrect = false; // Requires manual grading
      pointsEarned = 0;
      break;
  }

  return { isCorrect, pointsEarned };
}

export function calculateGrade(percentageScore: number) {
  if (percentageScore >= 90) return 'A';
  if (percentageScore >= 75) return 'B';
  if (percentageScore >= 60) return 'C';
  if (percentageScore >= 45) return 'D';
  return 'E';
}
