FROM ubuntu:16.04

MAINTAINER Guy Irvine <guy@guyirvine.com>

RUN echo "Update packages" \
  && export DEBIAN_FRONTEND=noninteractive \
  && apt-get -y update

RUN echo "Install packages 1" \
  && export DEBIAN_FRONTEND=noninteractive \
  && apt-get install -y \
      ruby \
      ruby-dev \
      git-core

RUN echo "Install packages 2" \
  && export DEBIAN_FRONTEND=noninteractive \
  && apt-get install -y \
      build-essential \
      libpq-dev

RUN echo "Setup locales" \
  && localedef -c -i en_NZ -f UTF-8 en_NZ.UTF-8 \
  && update-locale LANG=en_NZ.UTF-8

#RUN echo "Create user" \
#  && mkdir -p /opt/haveyoursay/ \
#  && groupadd --gid 1000 puser \
#  && useradd -m --home /home/puser --uid 1000 --gid puser --shell /bin/sh puser

RUN echo "Install required" \
  && gem install bundler pg:0.18.4 sinatra:1.4.7 thin:1.7.1

RUN echo "Cleaning up" \
  && apt-get autoremove -y \
  && apt-get clean -y \
  && rm -rf /var/lib/apt/lists/*

COPY . /opt/haveyoursay/

#USER fpuser

WORKDIR /opt/haveyoursay/

# Leaving in the node / bower commands as they will no doubt prove useful ...

RUN bundle install --without test development

ENV DB='pgsql://vagrant:password@localhost/haveyoursay'

EXPOSE 4568

ENTRYPOINT ["ruby", "app.rb", "-o", "0.0.0.0", "-p", "4568"]
