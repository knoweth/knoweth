class CreateDocuments < ActiveRecord::Migration[6.0]
  def change
    create_table :documents do |t|
      t.text :title

      t.text :content

      t.timestamps
    end

    add_reference :documents, :user, null: false, foreign_key: true
  end
end
