class Document < ApplicationRecord
  belongs_to :user
  has_many :knowledges, dependent: :destroy
  
  validates :title, presence: true
  validates :content, presence: true
end
