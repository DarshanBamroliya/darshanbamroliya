// The displayError function should be defined as well
function displayError(form, message) {
  form.querySelector('.loading').classList.remove('d-block');
  form.querySelector('.error-message').classList.add('d-block');
  form.querySelector('.error-message').textContent = message;
}

function php_email_form_submit(form, action, formData) {
  // You should implement the logic for form submission to the server here
  // For example, you can use fetch to send a POST request to the server
  fetch(action, {
    method: 'POST',
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      // Handle the response from the server as needed
      if (data.success) {
        form.querySelector('.sent-message').textContent = 'Your message has been sent. Thank you!';
      } else {
        displayError(form, 'Error submitting the form. Please try again.');
      }
    })
    .catch(error => {
      displayError(form, 'An error occurred while submitting the form.');
      console.error('Form submission error:', error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      let action = form.getAttribute('action');
      let recaptcha = form.getAttribute('data-recaptcha-site-key');

      // Validate form fields
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;

      if (!name || !email || !subject || !message) {
        displayError(form, 'Please fill in all fields.');
        return;
      }

      let formData = new FormData(form);

      // Additional check for blank data
      let hasBlankFields = false;
      formData.forEach(function (value) {
        if (!value.trim()) {
          hasBlankFields = true;
        }
      });

      if (hasBlankFields) {
        displayError(form, 'Please fill in all the fields.');
        return;
      }

      form.querySelector('.loading').classList.add('d-block');
      form.querySelector('.error-message').classList.remove('d-block');
      form.querySelector('.sent-message').classList.remove('d-block');

      if (recaptcha) {
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.ready(function () {
            try {
              grecaptcha.execute(recaptcha, { action: 'php_email_form_submit' })
                .then(token => {
                  formData.set('recaptcha-response', token);
                  php_email_form_submit(form, action, formData);
                });
            } catch (error) {
              displayError(form, error);
            }
          });
        } else {
          displayError(form, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(form, action, formData);
      }
    });
  });
});
