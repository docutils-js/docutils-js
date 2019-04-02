pipeline {
    options { timeout(time: 3, unit: 'MINUTES') }
    agent { docker {
    image 'node:latest'
    args '-v /.cache/yarn'
 } }
    stages {
        stage('build') {
            steps {
	        sh 'yarn'
		sh 'rm -rf lib'
		sh 'yarn jest'
		sh 'yarn grunt'
		sh 'mkdir -p build'
		sh 'tar --exclude core --exclude node_modules --exclude build --exclude-vcs -zcv . -f build/docutils-js.tar.gz'
            }
        }
    }
       post {
      always {
		junit 'junit.xml'
		      archiveArtifacts artifacts: 'build/*.tar.gz', fingerprint: true
		      archiveArtifacts artifacts: '**/__snapshots__/*', fingerprint: true
      }
      }

}