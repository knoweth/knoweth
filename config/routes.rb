Rails.application.routes.draw do
  devise_for :users
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  resources :documents
  get '/documents/review/:id', to: 'documents#review'

  root "welcome#index"
end
