pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = 'khady2026/portfolio-api'
        FRONTEND_IMAGE = 'khady2026/portfolio-react'
        TF_DIR         = "${WORKSPACE}/terraform-k8s"
    }

    triggers {
        githubPush()
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withCredentials([
                    string(credentialsId: 'sonar-api', variable: 'TOKEN_API'),
                    string(credentialsId: 'sonar-react', variable: 'TOKEN_REACT')
                ]) {
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                            set -e

                            echo "Attente SonarQube..."
                            for i in $(seq 1 30); do
                                RESPONSE=$(curl -s http://localhost:9000/api/system/status || true)
                                echo "Tentative $i - $RESPONSE"
                                echo "$RESPONSE" | grep -q '"status":"UP"' && break
                                sleep 10
                            done

                            sleep 20

                            rm -rf .scannerwork portfolio-api/.scannerwork React/.scannerwork

                            echo "=== ANALYSE BACKEND ==="
                            cd portfolio-api
                            /opt/sonar-scanner/bin/sonar-scanner \
                                -Dsonar.projectKey=portfolio-api \
                                -Dsonar.host.url="http://localhost:9000" \
                                -Dsonar.login="$TOKEN_API"

                            echo "=== ANALYSE FRONTEND ==="
                            cd ../React
                            /opt/sonar-scanner/bin/sonar-scanner \
                                -Dsonar.projectKey=portfolio-react \
                                -Dsonar.host.url="http://localhost:9000" \
                                -Dsonar.login="$TOKEN_REACT"
                        '''
                    }
                }
            }
        }

        stage('Build & Deploy Docker') {
            steps {
                sh '''
                    docker compose -p dockerisation \
                    -f $WORKSPACE/docker-compose.yml \
                    up -d --build --force-recreate --no-deps mongo api react
                '''
            }
        }

        stage('Terraform Plan') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                        export AWS_DEFAULT_REGION=eu-west-3

                        cd $TF_DIR
                        terraform init -input=false
                        terraform plan -input=false -out=tfplan
                    '''
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                        export AWS_DEFAULT_REGION=eu-west-3

                        cd $TF_DIR
                        terraform apply -input=false -auto-approve tfplan
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    kubectl --kubeconfig=/var/lib/jenkins/.kube/config \
                        set image deployment/portfolio-api api=khady2026/portfolio-api:latest -n portfolio

                    kubectl --kubeconfig=/var/lib/jenkins/.kube/config \
                        set image deployment/portfolio-react react=khady2026/portfolio-react:latest -n portfolio

                    kubectl --kubeconfig=/var/lib/jenkins/.kube/config \
                        rollout status deployment/portfolio-api -n portfolio --timeout=120s

                    kubectl --kubeconfig=/var/lib/jenkins/.kube/config \
                        rollout status deployment/portfolio-react -n portfolio --timeout=120s

                    kubectl --kubeconfig=/var/lib/jenkins/.kube/config get pods -n portfolio
                    echo "Deploiement OK"
                '''
            }
        }
    }

    post {
        success {
            mail to: 'khadypene267@gmail.com',
                subject: "✅SUCCESS - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline OK\nFrontend: http://localhost:3000\nBackend: http://localhost:5000\nSonarQube: http://localhost:9000"
        }

        failure {
            mail to: 'khadypene267@gmail.com',
                subject: "❌FAILED - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline echoue\n${env.BUILD_URL}"
        }

        always {
            sh 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}" || true'
        }
    }
}
