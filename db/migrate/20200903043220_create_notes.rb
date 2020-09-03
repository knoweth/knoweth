class CreateNotes < ActiveRecord::Migration[6.0]
  def change
    create_table :notes do |t|
      t.text :left
      t.text :right
      t.references :document, null: false, foreign_key: true

      t.timestamps
    end
  end
end
