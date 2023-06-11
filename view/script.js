document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Perform the login request to your GraphQL API
        const response = await fetch('http://localhost:3000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
            mutation {
              login(username: "${username}", password: "${password}") {
                token
              }
            }
          `,
            }),
        });

        const { data, errors } = await response.json();

        if (errors) {
            const errorMessage = errors[0].message;
            document.getElementById('error-message').textContent = errorMessage;
        } else {
            const token = data.login.token;
            // Handle successful login, e.g., store the token in local storage
            console.log('Login successful. Token:', token);
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }
});

document.getElementById('register-button').addEventListener('click', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    try {
        // Perform the registration request to your GraphQL API
        const response = await fetch('http://localhost:3000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
            mutation ($input: RegisterUserInput!) {
              registerUser(input: $input) {
                id
                username
                password
                role
              }
            }
          `,
                variables: {
                    input: {
                        username,
                        password,
                        role
                    }
                }
            }),
        });

        const { data, errors } = await response.json();

        if (errors) {
            const errorMessage = errors[0].message;
            document.getElementById('error-message').textContent = errorMessage;
        } else {
            const user = data.registerUser;
            // Handle successful registration, e.g., display a success message
            console.log('Registration successful. User:', user);
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }
});

document.getElementById('logout-button').addEventListener('click', async () => {
    // Perform the logout action, e.g., clear local storage, redirect to login page, etc.
    console.log('Logout clicked');
});
