class AddDocumentToKnowledges < ActiveRecord::Migration[6.0]
  def change
    add_reference :knowledges, :document, null: false, foreign_key: true
  end
end
