const getPercentage = (totalAmount, partialAmount) => {
  if (totalAmount === 0 || partialAmount === 0 || totalAmount < partialAmount) {
    return 0; // Avoid division by zero
  }

  const percentage = (partialAmount / totalAmount) * 100;
  return percentage;
};

module.exports = { getPercentage };
