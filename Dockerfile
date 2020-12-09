FROM ruby:2.7
RUN apt-get update -qq && apt-get install -y nodejs npm postgresql-client
RUN npm install -g yarn
RUN mkdir /app
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --check-files

COPY Gemfile* ./
RUN bundle install

COPY . .
RUN git describe --tags > VERSION
RUN git rev-parse --short HEAD > REVISION

RUN RAILS_ENV=production SECRET_KEY_BASE=precompile_placeholder bundle exec rake assets:precompile

EXPOSE 3000
# Start the main process.
CMD ["rails", "server", "-b", "0.0.0.0"]