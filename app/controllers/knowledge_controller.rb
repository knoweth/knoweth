class KnowledgeController < ApplicationController
  def upsert
    params.require(:knowledges)
    ks = params[:knowledges]
    ks.each do |k|
      k[:created_at] = Time.now
      k[:updated_at] = Time.now
    end
    Knowledge.upsert_all(ks, unique_by: :card_id)
  end
end
