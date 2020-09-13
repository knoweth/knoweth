class AddLastReviewToKnowledges < ActiveRecord::Migration[6.0]
  def change
    add_column :knowledges, :last_review, :timestamp
  end
end
