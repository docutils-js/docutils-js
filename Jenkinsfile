pipeline {
    options { timeout(time: 3, unit: 'MINUTES') }
    agent { docker {
    image 'node:latest'
    args '-v /.cache/yarn'
 } }
    stages {
        stage('Install NPM/Yarn dependencies') {
	  steps {
	  sh 'yarn install'
	  }
        }
        stage('build') {
            steps {
		sh 'rm -rf lib'
		sh 'yarn grunt'
		}
		}

       stage('tests with coverage') {
       steps {
         	sh 'yarn jest --coverage'
		}
		}
       stage('eslint') {
       steps {
		sh 'yarn eslint -f checkstyle -o eslint.xml src && /bin/true'
		}
		}

stage('build distribution') {
steps {
		sh 'mkdir -p build'
		sh 'tar --exclude core --exclude node_modules --exclude build --exclude-vcs -zcv . -f build/docutils-js.tar.gz'
            }
        }
    }
       post {
      always {
      	     recordIssues enabledForFailure: true, healthy: 100, minimumSeverity: 'NORMAL', sourceCodeEncoding: 'UTF-8', tools: [esLint(pattern: 'eslint.xml', reportEncoding: 'UTF-8')], unhealthy: 200

      publishHTML([allowMissing: false, alwaysLinkToLastBuild: true, keepAll: true, reportDir: 'coverage/lcov-report', reportFiles: 'index.html', reportName: 'Code Coverage', reportTitles: 'Project Coverage Overview'])
		junit 'junit.xml'
		      archiveArtifacts artifacts: 'build/*.tar.gz', fingerprint: true
		      archiveArtifacts artifacts: '**/__snapshots__/*', fingerprint: true
      }
      }

}