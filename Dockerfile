FROM ubuntu:14.04

MAINTAINER Guy Irvine <guyirvine@gmail.com>

RUN echo "Install packages" \
  && export DEBIAN_FRONTEND=noninteractive \
  && apt-get -y update \
  && apt-get install -y \
      ruby \
      ruby-dev \
      libpq-dev

RUN echo "Setup locales" \
  && localedef -c -i en_NZ -f UTF-8 en_NZ.UTF-8 \
  && update-locale LANG=en_NZ.UTF-8

RUN echo "Create user" \
  && mkdir -p /opt/haveyoursay/ \
  && groupadd --gid 1000 haveyoursay \
  && useradd -m --home /home/haveyoursay --uid 1000 --gid haveyoursay --shell /bin/sh haveyoursay

RUN echo "Install required" \
  && gem install bundler

RUN echo "Cleaning up" \
  && apt-get autoremove -y \
  && apt-get clean -y \
  && rm -rf /var/lib/apt/lists/*

COPY . /opt/haveyoursay/

USER haveyoursay

WORKDIR /opt/haveyoursay/

RUN bundle install --without test development

EXPOSE 6002

ENTRYPOINT ["bundle", "exec", "ruby", "app.rb", "-o", "0.0.0.0", "-p", "6002"]
