pipeline {
    agent any

    environment {
        APP_URL = 'http://192.168.1.33:3000'
    }

    stages {

        stage('1. Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/DarkRider09/Exams-securite-des-donnees'
            }
        }

        stage('2. Build / Preparation') {
            steps {
                sh '''
                   mkdir -p reports
                   echo "Vérification que Juice Shop est accessible sur ${APP_URL}..."
                   curl -s -o /dev/null -w "Code HTTP: %{http_code}\\n" ${APP_URL}
                '''
            }
        }

        stage('3. Security Analysis - SAST (Semgrep)') {
            steps {
                sh '''
                   semgrep --config=auto --json --output=reports/semgrep-report.json .
                '''
            }
        }

        stage('4. Additional Security Check - DAST (ZAP)') {
            steps {
                sh '''
                    docker run --rm --network host \
                        -v $(pwd)/reports:/zap/wrk/:rw \
                        zaproxy/zap-stable zap-baseline.py \
                        -t ${APP_URL} \
                        -J zap-report.json \
                        -r zap-report.html \
                        -I
                '''
            }
        }

        stage('5. Report Generation') {
            steps {
                sh '''
                    echo "Rapports générés :"
                    ls -la reports/
                '''
                archiveArtifacts artifacts: 'reports/*', allowEmptyArchive: true
            }
        }

        stage('6. Notification') {
            steps {
                script {
                    def semgrepCount = sh(
                        script: "cat reports/semgrep-report.json | grep -o '\"check_id\"' | wc -l || echo 0",
                        returnStdout: true
                    ).trim()

                    def zapAlerts = sh(
                        script: "cat reports/zap-report.json | grep -o '\"riskcode\"' | wc -l || echo 0",
                        returnStdout: true
                    ).trim()

                    emailext (
                        subject: "Rapport de sécurité — Build #${env.BUILD_NUMBER}",
                        body: """
                            Résultats de l'analyse de sécurité :

                            SAST (Semgrep) : ${semgrepCount} problèmes détectés
                            DAST (ZAP) : ${zapAlerts} alertes détectées

                            Rapports complets : ${env.BUILD_URL}artifact/reports/
                        """,
                        to: 'alesamb.gueye@unchk.edu.sn',
                        attachementsPattern: 'reports/*.json',
                        attachLog: false
                    )
                }
            }
        }
    }
}
