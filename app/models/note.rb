class Note < ApplicationRecord
  belongs_to :document

  has_rich_text :left
  has_rich_text :right
end
