#
# NodeJS
#

# Pull base image.
FROM google/nodejs:0.10.28

#MAINTAINER
MAINTAINER Javier García. AEON development team.

RUN apt-get update
RUN apt-get install git curl python2.7 build-essential -y
#RUN curl -sL https://deb.nodesource.com/setup | sudo bash -
#RUN sudo apt-get install nodejs -y
#RUN ls -n /usr/bin/nodejs /usr/bin/node

ENV PYTHON /usr/bin/python2.7

ADD . /aeon_data
ADD ./start.sh /tmp/

RUN chmod +x /tmp/start.sh

WORKDIR /aeon_data

CMD bash -C "/tmp/start.sh"; "bash"

EXPOSE 7789

