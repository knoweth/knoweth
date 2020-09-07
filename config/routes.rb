Rails.application.routes.draw do
  devise_for :users
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  resources :documents do
    resources :notes, only: [:create, :destroy, :update]
  end

  root "welcome#index"
end
