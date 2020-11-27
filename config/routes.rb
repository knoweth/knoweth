Rails.application.routes.draw do
  devise_for :users
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  resources :documents
  get '/documents/review/:id', to: 'documents#review'
  get '/documents/:id/rename', to: 'documents#rename'
  put 'knowledge/upsert'

  root "welcome#index"
end
