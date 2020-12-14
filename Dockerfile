FROM ruby:2.7

ARG IMAGE_REVISION
ARG IMAGE_VERSION
ENV IMAGE_REVISION=$IMAGE_REVISION
ENV IMAGE_VERSION=$IMAGE_VERSION

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get update -qq && \
    apt-get install -y nodejs postgresql-client && \
    npm install -g yarn
RUN mkdir /app
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --check-files

COPY Gemfile* ./
RUN bundle install

COPY . .

RUN RAILS_ENV=production SECRET_KEY_BASE=precompile_placeholder bundle exec rake assets:precompile

EXPOSE 3000
# Start the main process.
CMD ["rails", "server", "-b", "0.0.0.0"]