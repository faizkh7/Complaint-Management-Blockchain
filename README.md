# Resolvio - Blockchain Based Complaint Management System

Resolvio is a blockchain-based complaint management system designed to streamline the process of handling complaints efficiently and transparently. Leveraging blockchain technology ensures the integrity and security of complaint records while providing transparency to all stakeholders.

## Features
- **Blockchain Integration:** Utilizes blockchain technology for secure and immutable complaint records.
- **Efficient Complaint Handling:** Streamlines the process of submitting, processing, and resolving complaints.
- **Transparency:** Provides transparency to all stakeholders by maintaining a public ledger of complaints.
- **User-Friendly Interface:** Offers an intuitive user interface for easy navigation and complaint submission.

## Running the Project
To run Resolvio locally, make sure you have Docker and Docker Compose installed on your system. Then, follow these steps:

1. Clone the repository:
    
2. Navigate to the project directory:
    ```
    cd resolvio
    ```

3. Create a `docker-compose.yml` file with the following content:
    ```yaml
    version: '3.8'
    services:
      ganache:
        image: trufflesuite/ganache-cli:latest
        ports:
          - "8545:8545"
        build: 
          context: .
          dockerfile: Dockerfile.ganache
      server:
        build: ./server
        ports:
          - "5000:5000"
        depends_on: 
          - ganache
      web:
        build: ./client
        ports:
          - "3000:3000"
        depends_on:
          - server
    ```

4. Run Docker Compose to start the services:
    ```
    docker-compose up
    ```

5. Access Resolvio in your web browser at `http://localhost:3000`.


## Contributing
Contributions are welcome! Please feel free to submit pull requests or open issues.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
