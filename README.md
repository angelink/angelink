Angelink
======

Angelink provides an easy way to sift through all the available job postings on AngelList to find the ones catered to your skills, so you don't have to.

- Simply login with your LinkedIn credentials to find jobs matching your own skills.
- Update your latest skills and set your location, we’ve helped you get started.
- Show your interest in the jobs available and let the system learn your preferences.
- That's it, let our algorithms do the grunt of sorting through posting to find those suited to you.

- Come back regularly to keep up to date with the latest job postings.
- Let us get to know you. The more you tell us which jobs you want, the better our system gets.

Architected using Node/ExpressJS and Neo4j on the back, AngularJS and CSS3 on the front.

Quick Start
------

1. If not already on your system install homebrew, node and grunt.

2. Download the latest Java SE Development Kit from [here](http://www.oracle.com/technetwork/java/javase/downloads/index.html) (minimum Java 7).

3. Update homebrew and install neo4j:

  ```
    $ brew update
    $ brew install neo4j
  ```

4. Copy this repo into your local directory:

  ```
    $ git clone https://github.com/angelink/angelink
  ```

5. Get a API_KEY, SECRET_KEY, STATE codes by registering with [LinkedIn Developers](https://developer.linkedin.com) if you haven't got one already. Modify the server/config.js with your respective codes.

6. Start the neo4j server

  ```
    $ neo4j start
  ```

7. Start the client server to compile the CSS and Angular template:

  ```
    $ cd client
    $ grunt serve
  ```

8. Start the server:

  ```
    $ cd server
    $ grunt serve
  ```

9. Run a quick retreival of the data from AngelList to your local database:

  ```
    $ cd dbupdate/dbjobs
    $ node dbretreive.js
  ```

- Check out the neo4j database at http://127.0.0.1:7474 (do not use localhost) to play around with the database and Cypher Query Language.
- Check out the documentation for the API at http://127.0.0.1:3000/docs.
- Check out the running web app at http://127.0.0.1:3000. Log in with your LinkedIn details and get a feel for the system.

Happy Hacking.

Made with Fire and Blood by [@dremonkey](http://www.github.com/dremonkey) and [@leebyp](http://www.github.com/leebyp).