class WelcomeController < ApplicationController
  def index
    flash.now[:notice] = "TEST"
  end
end
