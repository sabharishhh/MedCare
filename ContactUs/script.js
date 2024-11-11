// JavaScript for toggling FAQ answers
const faqItems = document.querySelectorAll('.faq-item h3');
faqItems.forEach(item => {
  item.addEventListener('click', () => {
    const answer = item.nextElementSibling;
    answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
  });
});

// Display pop-up on form submission
document.querySelector('.contact-form form').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent form submission
  document.getElementById('popup').style.display = 'flex'; // Show pop-up
});

// Close the pop-up
document.getElementById('closePopup').addEventListener('click', function() {
  document.getElementById('popup').style.display = 'none';
});
