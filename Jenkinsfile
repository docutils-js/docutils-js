pipeline {
    options { timeout(time: 10, unit: 'MINUTES') }
    agent { docker {
    image 'node:latest'
    args '-v /.cache/yarn'
 } }
    stages {
        stage('build') {
            steps {
	        sh 'yarn'
		sh 'yarn grunt'
		sh 'node rst2xml-babel.js'
            }
        }
    }
}